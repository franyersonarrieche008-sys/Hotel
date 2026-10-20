import re
from typing import Annotated, NoReturn

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Path, Response, status
from pymongo.errors import PyMongoError

from database import get_reservas_collection
from models import ReservaCreate, ReservaResponse, ReservaUpdate

router = APIRouter(prefix="/reservas", tags=["Reservas"])
ReservaId = Annotated[str, Path()]


def _parse_reserva_id(reserva_id: str) -> ObjectId:
    try:
        return ObjectId(reserva_id)
    except InvalidId as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El identificador de la reserva no es válido.",
        ) from error


def _to_response(document: dict) -> ReservaResponse:
    return ReservaResponse(
        id=str(document["_id"]),
        nombre_huesped=document["nombre_huesped"],
        numero_habitacion=document["numero_habitacion"],
        noches=document["noches"],
        confirmada=document["confirmada"],
    )


def _raise_database_unavailable(error: PyMongoError) -> NoReturn:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="No se pudo completar la operación porque MongoDB no está disponible.",
    ) from error


async def _ensure_guest_name_is_unique(
    collection,
    nombre_huesped: str,
    exclude_id: ObjectId | None = None,
) -> None:
    query: dict = {
        "nombre_huesped": {
            "$regex": f"^{re.escape(nombre_huesped)}$",
            "$options": "i",
        }
    }
    if exclude_id is not None:
        query["_id"] = {"$ne": exclude_id}

    if await collection.find_one(query) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una reserva para ese nombre de huésped.",
        )


@router.post(
    "",
    response_model=ReservaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def crear_reserva(reserva: ReservaCreate) -> ReservaResponse:
    collection = get_reservas_collection()
    try:
        await _ensure_guest_name_is_unique(collection, reserva.nombre_huesped)
        result = await collection.insert_one(reserva.model_dump())
    except PyMongoError as error:
        _raise_database_unavailable(error)

    return ReservaResponse(id=str(result.inserted_id), **reserva.model_dump())


@router.get("", response_model=list[ReservaResponse])
async def listar_reservas() -> list[ReservaResponse]:
    try:
        documents = await get_reservas_collection().find().to_list(length=None)
        return [_to_response(document) for document in documents]
    except PyMongoError as error:
        _raise_database_unavailable(error)


@router.get("/{reserva_id}", response_model=ReservaResponse)
async def obtener_reserva(reserva_id: ReservaId) -> ReservaResponse:
    object_id = _parse_reserva_id(reserva_id)

    try:
        document = await get_reservas_collection().find_one({"_id": object_id})
    except PyMongoError as error:
        _raise_database_unavailable(error)

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la reserva.",
        )

    return _to_response(document)


@router.put("/{reserva_id}", response_model=ReservaResponse)
async def actualizar_reserva(
    reserva_id: ReservaId, reserva: ReservaCreate
) -> ReservaResponse:
    object_id = _parse_reserva_id(reserva_id)
    data = reserva.model_dump()
    collection = get_reservas_collection()

    try:
        if await collection.find_one({"_id": object_id}) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la reserva.",
            )
        await _ensure_guest_name_is_unique(
            collection, data["nombre_huesped"], object_id
        )
        result = await collection.update_one(
            {"_id": object_id},
            {"$set": data},
        )
    except PyMongoError as error:
        _raise_database_unavailable(error)

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la reserva.",
        )

    return ReservaResponse(id=str(object_id), **data)


@router.patch("/{reserva_id}", response_model=ReservaResponse)
async def actualizar_reserva_parcial(
    reserva_id: ReservaId, cambios: ReservaUpdate
) -> ReservaResponse:
    object_id = _parse_reserva_id(reserva_id)
    data = cambios.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes enviar al menos un campo para actualizar.",
        )

    collection = get_reservas_collection()
    try:
        if await collection.find_one({"_id": object_id}) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la reserva.",
            )
        if "nombre_huesped" in data:
            await _ensure_guest_name_is_unique(
                collection, data["nombre_huesped"], object_id
            )
        result = await collection.update_one(
            {"_id": object_id},
            {"$set": data},
        )
        document = await collection.find_one({"_id": object_id})
    except PyMongoError as error:
        _raise_database_unavailable(error)

    if result.matched_count == 0 or document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la reserva.",
        )

    return _to_response(document)


@router.delete(
    "/{reserva_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def eliminar_reserva(reserva_id: ReservaId) -> Response:
    object_id = _parse_reserva_id(reserva_id)

    try:
        result = await get_reservas_collection().delete_one({"_id": object_id})
    except PyMongoError as error:
        _raise_database_unavailable(error)

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la reserva.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
