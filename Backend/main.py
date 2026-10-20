from contextlib import asynccontextmanager

from decouple import config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import close_mongo_connection, connect_mongo
from router.entidades import router as reservas_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_mongo()
    try:
        yield
    finally:
        close_mongo_connection()


app = FastAPI(
    title="Reservas de habitaciones",
    description="API CRUD asíncrona para administrar reservas de hotel u hostal.",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_url = config("FRONTEND_URL", default="http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_url.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reservas_router)
