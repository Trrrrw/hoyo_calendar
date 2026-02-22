import os
import sys
from loguru import logger

from app.core.settings import settings

logs_dir = ".logs"
os.makedirs(logs_dir, exist_ok=True)
logger.remove()


def rel_path_patcher(record):
    # 获取当前运行目录
    base_path = os.getcwd()
    # 获取日志发生的绝对路径
    abs_path = record["file"].path
    try:
        # 计算相对路径，例如 "app/main.py"
        rel_path = os.path.relpath(abs_path, base_path)
    except ValueError:
        # 特殊情况（如跨盘符），回退到文件名
        rel_path = record["file"].name
    # 将计算好的相对路径存入 extra 字典，供 format 使用
    record["extra"]["rel_path"] = rel_path


format = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> |"
    "<level>{level: <7}</level> |"
    "<magenta>{extra[tag]: <10}</magenta> | "
    "<level>{message}</level> "
    "<dim>{extra[rel_path]}:{line}</dim>"
)

logger.add(
    f"{logs_dir}/app.log",
    format=format,
    colorize=False,
    enqueue=True,
    rotation="1 day",
    retention="7 days",
    compression="zip",
    encoding="utf-8",
)

logger.add(
    f"{logs_dir}/error.log",
    level="ERROR",
    filter=lambda record: record["level"].no >= 30,
    format=format,
    colorize=False,
    enqueue=True,
    rotation="1 day",
    retention="7 days",
    compression="zip",
    encoding="utf-8",
)

logger.add(
    sys.stderr,
    level=settings.log_level if not settings.debug else "DEBUG",
    format=format,
    colorize=True,
    enqueue=True,
)

logger.configure(
    extra={"tag": "SYSTEM"},
    patcher=rel_path_patcher,
)


def get_logger(tag: str = "SYSTEM"):
    """
    获取带有指定tag的logger实例
    """
    return logger.bind(tag=tag)


app_logger = get_logger()
