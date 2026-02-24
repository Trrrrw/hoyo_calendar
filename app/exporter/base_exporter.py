from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from app.utils.logger import get_logger
from app.core.settings import settings


class BaseExporter(ABC):
    logger = get_logger("EXPORTER")

    def __init__(self) -> None:
        self.output_file: Path = None

    @property
    @abstractmethod
    def file_extension(self) -> str:
        """文件扩展名"""
        raise NotImplementedError

    def set_output_file(self, game_name: str, data_type: str) -> None:
        """设置输出目录"""
        output_dir = Path(settings.output_folder) / self.file_extension / game_name
        output_dir.mkdir(parents=True, exist_ok=True)
        self.output_file = output_dir / f"{data_type}.{self.file_extension}"

    @abstractmethod
    def run(self, cal_name: str, notices: list[Any]) -> None:
        raise NotImplementedError
