import re
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from bson import ObjectId
from fastapi import HTTPException
from pydantic import ValidationError
from pymongo.errors import AutoReconnect

from main import app
from models import ReservaCreate, ReservaUpdate
from router.entidades import (
    actualizar_reserva,
    actualizar_reserva_parcial,
    crear_reserva,
    eliminar_reserva,
    listar_reservas,
    obtener_reserva,
)


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    async def to_list(self, length):
        return self.documents


class FakeCollection:
    def __init__(self):
        self.documents = {}

    async def insert_one(self, document):
        object_id = ObjectId()
        self.documents[object_id] = {"_id": object_id, **document}
        return SimpleNamespace(inserted_id=object_id)

    def find(self):
        return FakeCursor(list(self.documents.values()))

    async def find_one(self, query):
        for object_id, document in self.documents.items():
            if "_id" in query:
                identifier_filter = query["_id"]
                if isinstance(identifier_filter, dict):
                    if object_id == identifier_filter.get("$ne"):
                        continue
                elif object_id != identifier_filter:
                    continue

            name_filter = query.get("nombre_huesped")
            if name_filter is not None:
                pattern = re.compile(name_filter["$regex"], re.IGNORECASE)
                if not pattern.match(document["nombre_huesped"]):
                    continue
            return document
        return None

    async def update_one(self, query, update):
        document = self.documents.get(query["_id"])
        if document is None:
            return SimpleNamespace(matched_count=0)
        document.update(update["$set"])
        return SimpleNamespace(matched_count=1)

    async def delete_one(self, query):
        deleted = self.documents.pop(query["_id"], None)
        return SimpleNamespace(deleted_count=int(deleted is not None))


class ReservaCrudTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.collection = FakeCollection()
        self.collection_patcher = patch(
            "router.entidades.get_reservas_collection",
            return_value=self.collection,
        )
        self.collection_patcher.start()
        self.addCleanup(self.collection_patcher.stop)
        self.reserva = ReservaCreate(
            nombre_huesped="Ana Pérez",
            numero_habitacion=12,
            noches=3,
            confirmada=True,
        )

    async def test_create_and_list_reservas(self):
        creada = await crear_reserva(self.reserva)

        self.assertEqual(creada.nombre_huesped, "Ana Pérez")
        self.assertEqual(creada.numero_habitacion, 12)
        self.assertEqual(creada.noches, 3)
        self.assertTrue(creada.confirmada)
        self.assertEqual(len(await listar_reservas()), 1)

    async def test_get_reserva_by_id(self):
        creada = await crear_reserva(self.reserva)

        obtenida = await obtener_reserva(creada.id)

        self.assertEqual(obtenida, creada)

    async def test_update_reserva(self):
        creada = await crear_reserva(self.reserva)
        actualizada = ReservaCreate(
            nombre_huesped="Luis Díaz",
            numero_habitacion=5,
            noches=2,
            confirmada=False,
        )

        respuesta = await actualizar_reserva(creada.id, actualizada)

        self.assertEqual(respuesta.nombre_huesped, "Luis Díaz")
        self.assertEqual(respuesta.numero_habitacion, 5)
        self.assertFalse(respuesta.confirmada)
        self.assertEqual(await obtener_reserva(creada.id), respuesta)

    async def test_updating_reservation_keeps_its_own_guest_name(self):
        creada = await crear_reserva(self.reserva)

        respuesta = await actualizar_reserva(creada.id, self.reserva)

        self.assertEqual(respuesta, creada)

    async def test_update_of_missing_reserva_returns_404_before_duplicate_check(self):
        with self.assertRaises(HTTPException) as raised:
            await actualizar_reserva(str(ObjectId()), self.reserva)

        self.assertEqual(raised.exception.status_code, 404)

    async def test_partial_update_changes_only_submitted_fields(self):
        creada = await crear_reserva(self.reserva)

        respuesta = await actualizar_reserva_parcial(
            creada.id,
            ReservaUpdate(confirmada=False),
        )

        self.assertEqual(respuesta.nombre_huesped, "Ana Pérez")
        self.assertFalse(respuesta.confirmada)

    async def test_duplicate_guest_name_returns_400(self):
        await crear_reserva(self.reserva)
        duplicada = ReservaCreate(
            nombre_huesped="ana pérez",
            numero_habitacion=8,
            noches=1,
        )

        with self.assertRaises(HTTPException) as raised:
            await crear_reserva(duplicada)

        self.assertEqual(raised.exception.status_code, 400)

    async def test_delete_reserva(self):
        creada = await crear_reserva(self.reserva)

        respuesta = await eliminar_reserva(creada.id)

        self.assertEqual(respuesta.status_code, 204)
        self.assertEqual(await listar_reservas(), [])

    async def test_missing_reserva_returns_404(self):
        with self.assertRaises(HTTPException) as raised:
            await obtener_reserva(str(ObjectId()))

        self.assertEqual(raised.exception.status_code, 404)

    async def test_database_error_returns_503(self):
        with patch(
            "router.entidades.get_reservas_collection",
            side_effect=AutoReconnect("database unavailable"),
        ):
            with self.assertRaises(HTTPException) as raised:
                await listar_reservas()

        self.assertEqual(raised.exception.status_code, 503)

    async def test_invalid_id_returns_400(self):
        for invalid_id in ("z" * 24, "short"):
            with self.subTest(invalid_id=invalid_id):
                with self.assertRaises(HTTPException) as raised:
                    await obtener_reserva(invalid_id)

                self.assertEqual(raised.exception.status_code, 400)

    def test_reserva_fields_are_validated(self):
        with self.assertRaises(ValidationError):
            ReservaCreate(
                nombre_huesped=" ",
                numero_habitacion=0,
                noches=-1,
            )

        with self.assertRaises(ValidationError):
            ReservaUpdate(confirmada=None)

    def test_api_exposes_reservation_crud_routes(self):
        paths = app.openapi()["paths"]

        self.assertIn("post", paths["/reservas"])
        self.assertIn("get", paths["/reservas"])
        self.assertIn("get", paths["/reservas/{reserva_id}"])
        self.assertIn("put", paths["/reservas/{reserva_id}"])
        self.assertIn("patch", paths["/reservas/{reserva_id}"])
        self.assertIn("delete", paths["/reservas/{reserva_id}"])
        self.assertEqual(
            set(ReservaCreate.model_fields),
            {"nombre_huesped", "numero_habitacion", "noches", "confirmada"},
        )


if __name__ == "__main__":
    unittest.main()
