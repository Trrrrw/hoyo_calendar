from datetime import timedelta
from typing import Any

from app.exporter.base_exporter import BaseExporter
from app.models.calendar import Calendar
from app.models.event import Event
from app.models.birthday import Birthday


class ICSExporter(BaseExporter):
    """导出为 .ics 文件"""

    @property
    def file_extension(self) -> str:
        return "ics"

    def run(self, cal_name: str, notices: list[Any]) -> None:
        if isinstance(notices[0], Event):
            cal_timeline = Calendar(cal_name)
            for notice in notices:
                event_info = notice.extract_cal_event()
                start_event_info = event_info.copy()
                start_event_info["summary"] = f"🟢[开始]{event_info['summary']}"
                start_event_info["dtend"] = event_info["dtstart"] + timedelta(hours=1)
                end_event_info = event_info.copy()
                end_event_info["summary"] = f"🔴[结束]{event_info['summary']}"
                end_event_info["dtstart"] = event_info["dtend"] - timedelta(hours=1)
                cal_timeline.add_event(**start_event_info)
                cal_timeline.add_event(**end_event_info)
            cal_timeline.save(self.output_file)

            cal = Calendar(cal_name)
            for notice in notices:
                event_info = notice.extract_cal_event()
                cal.add_event(**event_info)
            cal.save(self.output_file.parent / f"{self.output_file.stem}-时间轴版.ics")
        elif isinstance(notices[0], Birthday):
            cal = Calendar(cal_name)
            for notice in notices:
                event_info = notice.extract_cal_event()
                cal.add_event(**event_info)
            cal.save(self.output_file)
