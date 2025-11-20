from abc import ABC, abstractmethod
from datetime import datetime

from src.models import Notice


class BaseParser(ABC):
    @abstractmethod
    def parse(self) -> list[Notice]:
        """整理数据"""
        pass

    @abstractmethod
    def parse_id(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def parse_title(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def parse_desc(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def parse_cover(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def parse_start(self, *args, **kwargs) -> datetime:
        pass

    @abstractmethod
    def parse_end(self, *args, **kwargs) -> datetime:
        pass

    @abstractmethod
    def parse_tag(self, *args, **kwargs) -> list[str]:
        pass

    @abstractmethod
    def parse_official(self, *args, **kwargs) -> str:
        pass

    @abstractmethod
    def parse_version(self, *args, **kwargs) -> list[str]:
        pass

    def sort_notice(self, notice_list: list[Notice]) -> list[Notice]:
        return sorted(notice_list, key=lambda n: n.start, reverse=True)
