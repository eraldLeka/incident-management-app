import logging
from logging.handlers import RotatingFileHandler
import sys
import os

#  directory 'logs/' exsist
os.makedirs("logs", exist_ok=True)

class ContextFilter(logging.Filter):
    def filter(self, record):
        if not hasattr(record, "request_id"):
            record.request_id = "N/A"
        if not hasattr(record, "user_email"):
            record.user_email = "N/A"
        return True

formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - [RequestID=%(request_id)s] [UserEmail=%(user_email)s] %(message)s"
)

file_handler = RotatingFileHandler(
    "logs/app.log", maxBytes=5*1024*1024, backupCount=5
)
file_handler.setFormatter(formatter)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)

logger = logging.getLogger("app_logger")

env = os.getenv("ENVIRONMENT", "development")
if env == "development":
    logger.setLevel(logging.DEBUG)
    console_handler.setLevel(logging.DEBUG)
else:
    logger.setLevel(logging.INFO)
    console_handler.setLevel(logging.INFO)

file_handler.setLevel(logging.INFO)

logger.addFilter(ContextFilter())

logger.addHandler(file_handler)
logger.addHandler(console_handler)

def info(msg, request_id="N/A", user_email="N/A"):
    logger.info(msg, extra={"request_id": request_id, "user_email": user_email})

def debug(msg, request_id="N/A", user_email="N/A"):
    logger.debug(msg, extra={"request_id": request_id, "user_email": user_email})

def warning(msg, request_id="N/A", user_email="N/A"):
    logger.warning(msg, extra={"request_id": request_id, "user_email": user_email})

def error(msg, request_id="N/A", user_email="N/A"):
    logger.error(msg, extra={"request_id": request_id, "user_email": user_email})

def exception(msg, request_id="N/A", user_email="N/A"):
    logger.exception(msg, extra={"request_id": request_id, "user_email": user_email})
