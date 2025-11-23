import pytz
import zlib
from icalendar import Calendar, Event
from datetime import datetime
from typing import Optional
from pathlib import Path


class _Event(Event):
    def __init__(
        self,
        summary: str,
        dtstart: datetime,
        description: str,
        location: str,
        dtend: Optional[datetime] = None,
    ) -> None:
        super().__init__()
        self.add("summary", summary)
        self.add(
            "dtstart",
            dtstart.replace(tzinfo=pytz.timezone("Asia/Shanghai")),
        )
        if dtend is not None:
            self.add(
                "dtend",
                dtend.replace(tzinfo=pytz.timezone("Asia/Shanghai")),
            )
        self.add("description", description)
        self.add("location", location)
        self.add("transp", "TRANSPARENT")
        self.add(
            "uid",
            f"{(zlib.crc32((summary + dtstart.isoformat()).encode('utf-8')) & 0xFFFFFFFF):08x}@trrw.tech",
        )


class _Calendar(Calendar):
    def __init__(self) -> None:
        super().__init__()
        self._my_events = []
        self.add("prodid", "-//Trrrrw/hoyo_calendar//GitHub/CN")
        self.add("version", "2.0")
        self.add("calscale", "GREGORIAN")
        self.add("method", "PUBLISH")

    def add_event(
        self,
        summary: str,
        dtstart: datetime,
        description: str,
        location: str,
        dtend: Optional[datetime] = None,
    ) -> None:
        event = _Event(
            summary=summary,
            dtstart=dtstart,
            description=description,
            location=location,
            dtend=dtend,
        )
        self.add_component(event)
        self._my_events.append(event)

    def save(self, path: Path) -> bool:
        if not path.parent.exists():
            path.parent.mkdir(parents=True)
        with open(path, "wb") as f:
            f.write(self.to_ical())
            return True
        return False

    def save_conti(self, path: Path) -> bool:
        if not path.parent.exists():
            path.parent.mkdir(parents=True)
        conti_ics_path = path.with_name(f"{path.stem}_conti{path.suffix}")
        with open(conti_ics_path, "wb") as f:
            f.write(self.to_ical())
            return True
        return False

    def __len__(self) -> int:
        return super().__len__()


class MyCalendar:
    def __init__(self) -> None:
        self.cal = _Calendar()
        self.conti_cal = _Calendar()

    def add_event(
        self,
        summary: str,
        dtstart: datetime,
        description: str,
        location: str,
        dtend: datetime,
    ) -> None:
        self.cal.add_event(
            summary=summary,
            dtstart=dtstart,
            description=description,
            location=location,
        )
        self.cal.add_event(
            summary=f"{summary} 结束",
            dtstart=dtend,
            description=description,
            location=location,
        )
        self.conti_cal.add_event(
            summary=summary,
            dtstart=dtstart,
            description=description,
            location=location,
            dtend=dtend,
        )

    def save(self, path: Path) -> bool:
        return self.cal.save(path) and self.conti_cal.save_conti(path)
