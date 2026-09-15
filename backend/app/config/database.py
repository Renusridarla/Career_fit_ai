import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    try:
        db_manager.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        
        # Test connection ping
        await db_manager.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB at %s", settings.MONGODB_URI)
        
        # Create indexes
        await create_indexes()
    except Exception as e:
        logger.warning("Could not connect to MongoDB server: %s. Requests requiring DB persistence will fail unless MongoDB is running.", e)

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def create_indexes():
    if db_manager.db is None:
        return
    try:
        await db_manager.db.users.create_index("email", unique=True)
        await db_manager.db.resumes.create_index("user_id")
        await db_manager.db.jobs.create_index("user_id")
        await db_manager.db.analyses.create_index("user_id")
        await db_manager.db.analyses.create_index("job_id")
        await db_manager.db.tailored_resumes.create_index("user_id")
        await db_manager.db.tailored_resumes.create_index("analysis_id")
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.error("Error creating indexes: %s", e)

def get_database():
    return db_manager.db
