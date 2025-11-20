import os, sys

from loguru import logger


def setup_logger() -> None:
    """
    初始化日志
    """
    os.makedirs("logs", exist_ok=True)
    logger.remove()

    format = (
        "<level>[{level: <7}]</level> "
        "<level>{message}</level> "
        "<<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan>> "
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> "
    )

    logger.add(
        "logs/app.log",
        format=format,
        colorize=False,
        enqueue=False,
        rotation="1 day",
        retention="7 days",
        compression="zip",
        encoding="utf-8",
    )
    logger.add(
        "logs/error.log",
        level="ERROR",
        filter=lambda record: record["level"].no >= 30,
        format=format,
        colorize=False,
        enqueue=False,
        rotation="1 day",
        retention="7 days",
        compression="zip",
        encoding="utf-8",
    )
    logger.add(
        sys.stderr,
        format=format,
        colorize=True,
        enqueue=False,
    )
