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
        rrule = {
            "freq": "yearly",
        }
        if self.month == 2 and self.day == 29:
            rrule["bymonth"] = 2
            rrule["bymonthday"] = [28, 29]
            rrule["bysetpos"] = -1
        return {
            "summary": f"{self.name}的生日",
            "dtstart": datetime(self.release_date.year, self.month, self.day),
            "description": f"{self.name}的生日",
            "rrule": rrule,
        }
