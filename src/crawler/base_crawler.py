from abc import ABC, abstractmethod


class BaseCrawler(ABC):
    @abstractmethod
    def fetch(self) -> dict:
        """获取原始数据"""
        pass
