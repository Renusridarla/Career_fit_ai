import logging
import copy
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger(__name__)

class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class UpdateResult:
    def __init__(self, matched_count=0, modified_count=0):
        self.matched_count = matched_count
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, deleted_count=0):
        self.deleted_count = deleted_count

class InMemoryCursor:
    def __init__(self, docs):
        self.docs = list(docs)
    
    def sort(self, key, direction=1):
        reverse = (direction == -1)
        self.docs.sort(key=lambda d: str(d.get(key, "")) if d.get(key) is not None else "", reverse=reverse)
        return self

    async def to_list(self, length=None):
        if length is not None:
            return copy.deepcopy(self.docs[:length])
        return copy.deepcopy(self.docs)

    def __aiter__(self):
        self._iter = iter(self.docs)
        return self

    async def __anext__(self):
        try:
            return copy.deepcopy(next(self._iter))
        except StopIteration:
            raise StopAsyncIteration

class InMemoryCollection:
    def __init__(self):
        self.docs = []

    def _matches(self, doc, filter_dict):
        if not filter_dict:
            return True
        for k, v in filter_dict.items():
            doc_val = doc.get(k)
            if isinstance(v, ObjectId) or isinstance(doc_val, ObjectId):
                if str(doc_val) != str(v):
                    return False
            elif doc_val != v:
                return False
        return True

    async def find_one(self, filter_dict=None):
        if filter_dict is None:
            filter_dict = {}
        for d in self.docs:
            if self._matches(d, filter_dict):
                return copy.deepcopy(d)
        return None

    async def insert_one(self, doc):
        d = copy.deepcopy(doc)
        if "_id" not in d or not d["_id"]:
            d["_id"] = ObjectId()
        elif isinstance(d["_id"], str):
            try:
                d["_id"] = ObjectId(d["_id"])
            except Exception:
                pass
        self.docs.append(d)
        return InsertResult(d["_id"])

    async def update_one(self, filter_dict, update_dict):
        for idx, d in enumerate(self.docs):
            if self._matches(d, filter_dict):
                if "$set" in update_dict:
                    for sk, sv in update_dict["$set"].items():
                        d[sk] = copy.deepcopy(sv)
                return UpdateResult(matched_count=1, modified_count=1)
        return UpdateResult(matched_count=0, modified_count=0)

    async def delete_one(self, filter_dict):
        for idx, d in enumerate(self.docs):
            if self._matches(d, filter_dict):
                del self.docs[idx]
                return DeleteResult(deleted_count=1)
        return DeleteResult(deleted_count=0)

    def find(self, filter_dict=None):
        if filter_dict is None:
            filter_dict = {}
        matched = [d for d in self.docs if self._matches(d, filter_dict)]
        return InMemoryCursor(matched)

    async def create_index(self, *args, **kwargs):
        return True

class InMemoryDatabase:
    def __init__(self):
        self.users = InMemoryCollection()
        self.resumes = InMemoryCollection()
        self.jobs = InMemoryCollection()
        self.analyses = InMemoryCollection()
        self.tailored_resumes = InMemoryCollection()
        self._seed_default_users()

    def _seed_default_users(self):
        try:
            from app.utils.security import hash_password
            now = datetime.utcnow()
            default_pass = hash_password("Password123")
            
            # Seed student demo user
            self.users.docs.append({
                "_id": ObjectId("660000000000000000000001"),
                "name": "Alex Johnson",
                "email": "student@careerfit.ai",
                "password_hash": default_pass,
                "created_at": now
            })
            
            # Seed renusridarla demo user
            self.users.docs.append({
                "_id": ObjectId("660000000000000000000002"),
                "name": "renusri",
                "email": "renusridarla@gmail.com",
                "password_hash": default_pass,
                "created_at": now
            })
            logger.info("InMemoryDatabase seeded with default demo accounts.")
        except Exception as e:
            logger.warning("Failed to seed default users in InMemoryDatabase: %s", e)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db = None
    is_fallback: bool = False

db_manager = DatabaseManager()

async def connect_to_mongo():
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Test connection ping
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.DATABASE_NAME]
        db_manager.is_fallback = False
        logger.info("Successfully connected to MongoDB at %s", settings.MONGODB_URI)
        await create_indexes()
    except Exception as e:
        logger.warning("Could not connect to MongoDB (%s). Activating resilient InMemoryDatabase fallback.", e)
        db_manager.db = InMemoryDatabase()
        db_manager.is_fallback = True

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def create_indexes():
    if db_manager.db is None or db_manager.is_fallback:
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
