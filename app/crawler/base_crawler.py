import zlib
from abc import ABC, abstractmethod
from typing import Any

from app.utils.logger import get_logger


class BaseCrawler(ABC):
    logger = get_logger("CRAWLER")

    @property
    @abstractmethod
    def cal_name(self) -> str:
        """日历名称"""
        raise NotImplementedError

    @abstractmethod
    def run(self) -> list[Any]:
        """获取原始数据"""
        raise NotImplementedError

    def generate_id(self, title: str) -> str:
        """
        生成活动 ID
        :param title: 活动标题
        :return: 8 位十六进制 ID
        """
        crc_value = zlib.crc32(title.encode("utf-8"))
        # 确保结果为 32 位无符号整数
        crc_value &= 0xFFFFFFFF
        # 格式化为 8 位十六进制字符串
        return f"{crc_value:08x}"
