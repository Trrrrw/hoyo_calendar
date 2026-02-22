import json
from typing import Any

from app.exporter.base_exporter import BaseExporter


class JsonExporter(BaseExporter):
    """导出为 .json 文件"""

    @property
    def file_extension(self) -> str:
        return "json"

    def run(self, cal_name: str, notices: list[Any]) -> None:
        content = [notice.model_dump(mode="json") for notice in notices]

        with open(self.output_file, "w", encoding="utf-8") as f:
            json.dump(content, f, ensure_ascii=False, indent=4)
