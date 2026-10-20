from decouple import config
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pymongo.errors import PyMongoError

MONGODB_URL = config("MONGODB_URL", default="mongodb://localhost:27017")
MONGODB_DATABASE = config("MONGODB_DATABASE", default="hotel")

client: AsyncIOMotorClient | None = None


async def connect_mongo() -> None:
    global client

    client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    try:
        await client.admin.command("ping")
    except PyMongoError:
        client.close()
        client = None
        raise


def get_reservas_collection() -> AsyncIOMotorCollection:
    if client is None:
        raise RuntimeError("MongoDB no está conectado.")
    return client[MONGODB_DATABASE]["reservas"]


def close_mongo_connection() -> None:
    global client

    if client is not None:
        client.close()
        client = None
