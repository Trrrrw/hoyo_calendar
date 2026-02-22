import time
from datetime import datetime, timedelta

from app.utils.logger import app_logger
from app.core.scheduler import scheduler
from app.core.factory import Factory


def run_all_pipelines():
    start_time = datetime.now()
    app_logger.info(f"{'=' * 20} {start_time.strftime('%Y-%m-%d %H:%M:%S')} {'=' * 20}")
    try:
        # 依次运行每个pipeline
        for pipeline in Factory.get_all_pipelines():
            pipeline.run()
        app_logger.success("所有爬虫管道执行完成")
    except Exception:
        app_logger.exception("爬虫任务执行异常")
    finally:
        elapsed = datetime.now() - start_time
        secs = f" 任务耗时{elapsed.total_seconds():.2f}s "
        app_logger.info(f"{'=' * 20}{secs:=^14}{'=' * 20}")
        app_logger.opt(raw=True).info("\n")


def main():
    app_logger.info("启动 hoyo-calendar 应用")
    scheduler.start()
    try:
        scheduler.add_job(
            func=run_all_pipelines,
            trigger="interval",
            days=1,
            job_id="run_all_pipelines",
            next_run_time=datetime.now() + timedelta(seconds=1),
            replace_existing=True,
        )
        # 保持程序运行
        app_logger.info("应用已启动，按 Ctrl+C 退出")
        app_logger.opt(raw=True).info("\n")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        app_logger.opt(raw=True).info("\n")
        app_logger.info("接收到退出信号，正在关闭应用...")
    finally:
        # 关闭调度器
        scheduler.shutdown()
        app_logger.info("应用已关闭")


if __name__ == "__main__":
    main()
