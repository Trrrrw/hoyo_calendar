from datetime import datetime
from typing import Any
from pydantic import BaseModel


class Birthday(BaseModel):
    id: str
    name: str
    month: int
    day: int
    release_date: datetime

    def extract_cal_event(self) -> dict[str, Any]:
        return {
            "summary": f"{self.name}的生日",
            "dtstart": datetime(self.release_date.year, self.month, self.day),
            "description": f"{self.name}的生日",
            "rrule": {
                "freq": "yearly",
            },
        }
