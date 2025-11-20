import time
import threading
from loguru import logger
from apscheduler.schedulers.background import BackgroundScheduler

from src.utils import setup_logger
from src.core import run_all_pipelines
from src.server import HTTPServer


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_all_pipelines, "interval", hours=1)
    scheduler.start()
    logger.info("APScheduler 已启动")
    return scheduler


def start_http_server():
    server = HTTPServer(host="0.0.0.0")
    t = threading.Thread(target=server.start, daemon=True)
    t.start()
    return server


if __name__ == "__main__":
    setup_logger()

    http_server = start_http_server()
    scheduler = start_scheduler()

    logger.opt(raw=True).info("\n")
    threading.Thread(target=run_all_pipelines, daemon=True).start()

    try:
        while True:
            time.sleep(2)
    except KeyboardInterrupt:
        logger.opt(raw=True).info("\n")
        logger.info("正在关闭...")
        scheduler.shutdown()
        http_server.stop()
        logger.info("已退出")
