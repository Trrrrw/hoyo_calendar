from apscheduler.schedulers.background import BackgroundScheduler
from app.utils.logger import get_logger


class Scheduler:
    """
    任务调度器类，用于管理爬虫任务的定时执行
    """

    def __init__(self):
        self.logger = get_logger(tag="SCHEDULER")
        self.scheduler = BackgroundScheduler()
        self.jobs = {}

    def start(self):
        """
        启动调度器
        """
        try:
            self.scheduler.start()
            self.logger.success("调度器启动成功")
        except Exception as e:
            self.logger.error(f"调度器启动失败: {str(e)}")

    def shutdown(self):
        """
        关闭调度器
        """
        try:
            self.scheduler.shutdown()
            self.logger.success("调度器已关闭")
        except Exception as e:
            self.logger.error(f"调度器关闭失败: {str(e)}")

    def add_job(self, func, trigger, job_id, **kwargs):
        """
        添加定时任务

        Args:
            func: 要执行的函数
            trigger: 触发器，可以是 cron 表达式、间隔时间等
            job_id: 任务唯一标识
            **kwargs: 其他参数
        """
        try:
            job = self.scheduler.add_job(
                func=func, trigger=trigger, id=job_id, **kwargs
            )
            self.jobs[job_id] = job
            self.logger.success(f"添加任务成功: {job_id}")
            return job
        except Exception as e:
            self.logger.error(f"添加任务失败 {job_id}: {str(e)}")
            return None

    def remove_job(self, job_id):
        """
        移除定时任务

        Args:
            job_id: 任务唯一标识
        """
        try:
            self.scheduler.remove_job(job_id)
            if job_id in self.jobs:
                del self.jobs[job_id]
            self.logger.success(f"移除任务成功: {job_id}")
        except Exception as e:
            self.logger.error(f"移除任务失败 {job_id}: {str(e)}")

    def pause_job(self, job_id):
        """
        暂停定时任务

        Args:
            job_id: 任务唯一标识
        """
        try:
            self.scheduler.pause_job(job_id)
            self.logger.success(f"暂停任务成功: {job_id}")
        except Exception as e:
            self.logger.error(f"暂停任务失败 {job_id}: {str(e)}")

    def resume_job(self, job_id):
        """
        恢复定时任务

        Args:
            job_id: 任务唯一标识
        """
        try:
            self.scheduler.resume_job(job_id)
            self.logger.success(f"恢复任务成功: {job_id}")
        except Exception as e:
            self.logger.error(f"恢复任务失败 {job_id}: {str(e)}")

    def get_job(self, job_id):
        """
        获取任务信息

        Args:
            job_id: 任务唯一标识

        Returns:
            任务对象
        """
        return self.scheduler.get_job(job_id)

    def list_jobs(self):
        """
        列出所有任务

        Returns:
            任务列表
        """
        jobs = self.scheduler.get_jobs()
        self.logger.info(f"当前任务数量: {len(jobs)}")
        for job in jobs:
            self.logger.debug(f"任务: {job.id}, 下次运行时间: {job.next_run_time}")
        return jobs


# 创建调度器实例
scheduler = Scheduler()
