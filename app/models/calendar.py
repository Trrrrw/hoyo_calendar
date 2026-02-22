import pytz
import zlib
from pathlib import Path
from datetime import datetime
from typing import Any, Optional
from icalendar import Calendar as ICalendar
from icalendar import Event as IEvent
from icalendar import vRecur

from app.utils.logger import get_logger

TZ = pytz.timezone("Asia/Shanghai")

logger = get_logger("CALENDAR")


class CalEvent(IEvent):
    def __init__(
        self,
        summary: str,
        dtstart: datetime,
        dtend: Optional[datetime] = None,
        description: str = "",
        location: str = "",
        rrule: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__()

        self.add("summary", summary)
        self.add(
            "dtstart",
            dtstart.replace(tzinfo=TZ),
        )
        if dtend:
            self.add(
                "dtend",
                dtend.replace(tzinfo=TZ),
            )
        if description:
            self.add("description", description)
        if location:
            self.add("location", location)
        if rrule:
            self.add("rrule", vRecur(rrule))

        self.add("transp", "TRANSPARENT")
        self.add("dtstamp", datetime.now(TZ))
        self.add("uid", self._generate_uid(summary, dtstart))

    def _generate_uid(self, summary: str, dtstart: datetime) -> str:
        """生成唯一标识符"""
        return f"{(zlib.crc32((summary + dtstart.isoformat()).encode('utf-8')) & 0xFFFFFFFF):08x}@trrw.tech"


class Calendar(ICalendar):
    def __init__(self, cal_name: str) -> None:
        super().__init__()
        self.add("prodid", "-//Trrrrw/hoyo_calendar//GitHub/CN")
        self.add("version", "2.0")
        self.add("calscale", "GREGORIAN")
        self.add("method", "PUBLISH")

        self.add("name", cal_name)
        self.add("x-wr-calname", cal_name)

        self.add("tzid", "Asia/Shanghai")
        self.add("x-wr-timezone", "Asia/Shanghai")

    def add_event(
        self,
        summary: str,
        dtstart: datetime,
        dtend: Optional[datetime] = None,
        description: str = "",
        location: str = "",
        rrule: Optional[dict[str, Any]] = None,
    ) -> None:
        event = CalEvent(
            summary,
            dtstart,
            dtend,
            description,
            location,
            rrule,
        )
        self.add_component(event)

    def save(self, path: Path) -> None:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, "wb") as f:
                f.write(self.to_ical())
        except Exception:
            logger.exception(f"保存日历到 {path} 失败")
