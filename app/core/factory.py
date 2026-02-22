from typing import TypeVar, Iterable

from app.utils.logger import get_logger
from app.core.pipeline import Pipeline
from app.crawler.base_crawler import BaseCrawler
from app.exporter.base_exporter import BaseExporter


T = TypeVar("T")


class Factory:
    logger = get_logger(__name__.upper())

    @classmethod
    def get_all_pipelines(cls) -> Iterable[Pipeline]:
        crawlers = cls._get_instances(BaseCrawler)
        exporters = cls._get_instances(BaseExporter)

        for crawler in crawlers:
            yield Pipeline(crawler, exporters)

    @classmethod
    def _get_instances(cls, base_class: type[T]) -> list[T]:
        """获取基类的所有子类实例"""
        instances = []
        for subclass in base_class.__subclasses__():
            try:
                instance = subclass()
                instances.append(instance)
            except Exception:
                cls.logger.exception(f"初始化 {subclass.__name__} 失败")
        return instances
