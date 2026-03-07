from datetime import datetime

from app.crawler.base_crawler import BaseCrawler
from app.models.birthday import Birthday


class SRBirthday(BaseCrawler):
    @property
    def game_name(self) -> str:
        return "崩坏：星穹铁道"

    @property
    def data_type(self) -> str:
        return "生日"

    def run(self) -> list[Birthday]:
        notices: list[Birthday] = []
        notices.append(
            Birthday(
                id=self.generate_id("三月七"),
                name="三月七",
                month=3,
                day=7,
                release_date=datetime(2023, 4, 26),
            )
        )
        return notices
