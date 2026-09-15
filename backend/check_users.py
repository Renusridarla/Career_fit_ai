import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.security import verify_password

async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.careerfit_db
    users = await db.users.find().to_list(100)
    print("Found", len(users), "users:")
    for u in users:
        print(" - Email:", repr(u.get("email")), "| Name:", u.get("name"))
        is_pass123 = verify_password("Password123", u.get("password_hash", ""))
        print("   Password123 valid?:", is_pass123)

if __name__ == "__main__":
    asyncio.run(check())
