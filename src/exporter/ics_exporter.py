from pathlib import Path
from loguru import logger

from src.models import Notice, MyCalendar
from .base_exporter import BaseExporter


class ICSExporter(BaseExporter):
    """导出为 .ics 文件"""

    def export(self, notices: list[Notice], folder: Path) -> bool:
        cal = MyCalendar()
        [
            cal.add_event(
                summary=notics.title,
                dtstart=notics.start,
                description=notics.desc,
                location=notics.official,
                dtend=notics.end,
            )
            for notics in notices
            if not notics.has_empty_field()
        ]
        path = folder / "all.ics"
        if cal.save(path):
            logger.success(f"导出为: {path}")
            return True
        return False
