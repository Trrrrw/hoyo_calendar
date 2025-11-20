from pydantic import BaseModel
from datetime import datetime


class Notice(BaseModel):
    id: str
    title: str
    desc: str
    cover: str
    start: datetime
    end: datetime
    tag: list[str]
    official: str
    version: list[str]

    def has_empty_field(self) -> bool:
        for value in self.model_dump().values():
            if not value:
                return True
        return False
