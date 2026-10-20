# Reservas de Casa Serena

API REST asíncrona para administrar reservas de hotel u hostal con FastAPI,
Motor y MongoDB. La estructura separa los modelos, la conexión a datos y las
rutas de la API.

## Estructura

```text
Backend/
├── router/
│   └── entidades.py
├── tests/
├── .env.example
├── database.py
├── main.py
├── models.py
└── requirements.txt
```

## Configuración y ejecución

Requiere Python 3.10 o superior y MongoDB. Desde esta carpeta, crea y activa el
entorno virtual, instala las dependencias y copia `.env.example` a `.env` para
ajustar la URL de MongoDB, la base de datos y el origen del frontend.

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

La API valida la conexión a MongoDB al iniciar. La documentación interactiva
está disponible en `http://localhost:8000/docs`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| `POST` | `/reservas` | Crear una reserva |
| `GET` | `/reservas` | Listar reservas |
| `GET` | `/reservas/{reserva_id}` | Consultar una reserva |
| `PUT` | `/reservas/{reserva_id}` | Reemplazar una reserva |
| `PATCH` | `/reservas/{reserva_id}` | Actualizar campos enviados |
| `DELETE` | `/reservas/{reserva_id}` | Eliminar una reserva |

El modelo contiene `nombre_huesped`, `numero_habitacion`, `noches` y
`confirmada`. El nombre de huésped no se puede repetir (sin distinguir
mayúsculas/minúsculas); la habitación y las noches deben ser enteros positivos.
Los identificadores inválidos generan HTTP 400 y las reservas inexistentes
HTTP 404.

## Pruebas

```powershell
python -m unittest discover -s tests -v
```
