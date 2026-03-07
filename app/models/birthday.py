from datetime import datetime, date, timedelta
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
        start_date = date(self.release_date.year, self.month, self.day)
        end_date = start_date + timedelta(days=1)
        return {
            "summary": f"{self.name}的生日",
            "dtstart": start_date,
            "dtend": end_date,
            "description": f"{self.name}的生日",
            "rrule": rrule,
        }
