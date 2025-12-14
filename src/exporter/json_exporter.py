import json
from loguru import logger
from pathlib import Path
from pydantic.json import pydantic_encoder

from .base_exporter import BaseExporter
from src.models import Notice


class JsonExporter(BaseExporter):
    """导出为 .json 文件"""

    def export(self, notices: list[Notice], folder: Path) -> bool:
        data = [notice.model_dump() for notice in notices]
        path = folder / "all.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, default=pydantic_encoder, ensure_ascii=False, indent=2)
            logger.success(f"导出为: {path}")
            return True
        return False
