import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message
from aiogram.fsm.storage.memory import MemoryStorage
from dotenv import load_dotenv
import os

# .env faylni yuklaymiz
load_dotenv()

# .env dan ma'lumotlarni olamiz
API_TOKEN = os.getenv("BOT_TOKEN")
CHANNEL_USERNAME = os.getenv("CHANNEL_USERNAME")

# Bot va dispatcher
bot = Bot(token=API_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# Web App tugmasidan kelgan signal
@dp.message(F.web_app_data)
async def check_membership(message: Message):
    if message.web_app_data.data == "check_membership":
        user_id = message.from_user.id
        try:
            member = await bot.get_chat_member(CHANNEL_USERNAME, user_id)
            status = member.status

            if status in ["member", "administrator", "creator"]:
                await message.answer("✅ Siz kanalga a'zosiz! Davom etishingiz mumkin.")
            else:
                await message.answer("❌ Siz hali kanalga aʼzo emassiz.")
        except Exception as e:
            await message.answer(f"⚠️ Xatolik yuz berdi: {e}")

# Botni ishga tushiramiz
async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())