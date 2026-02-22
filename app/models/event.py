from typing import Any
from pydantic import BaseModel
from datetime import datetime


class Event(BaseModel):
    id: str
    title: str
    desc: str
    start: datetime
    end: datetime
    tags: list[str]
    url: str

    def extract_cal_event(self) -> dict[str, Any]:
        description = "\n\n".join([self.desc, ",".join(self.tags)]).strip()
        return {
            "summary": self.title,
            "dtstart": self.start,
            "dtend": self.end,
            "description": description,
            "location": self.url,
        }
