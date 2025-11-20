from abc import ABC, abstractmethod
from src.models import Notice


class BaseExporter(ABC):
    @abstractmethod
    def export(self, notices: list[Notice], path: str):
        """将公告导出为文件"""
        pass
