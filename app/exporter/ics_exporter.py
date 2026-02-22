from typing import Any

from app.exporter.base_exporter import BaseExporter
from app.models.calendar import Calendar


class ICSExporter(BaseExporter):
    """导出为 .ics 文件"""

    @property
    def file_extension(self) -> str:
        return "ics"

    def run(self, cal_name: str, notices: list[Any]) -> None:
        cal = Calendar(cal_name)
        for notice in notices:
            event_info = notice.extract_cal_event()
            cal.add_event(**event_info)
        cal.save(self.output_file)
