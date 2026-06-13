import time
from datetime import datetime

from app.crawler.base_crawler import BaseCrawler
from app.models.dto.bili_wiki_ask import BiliWikiAskResponse
from app.models.event import Event
from app.services.bili_wiki_helper import get_site


class GenshinGacha(BaseCrawler):
    @property
    def game_name(self) -> str:
        return "原神"

    @property
    def data_type(self) -> str:
        return "卡池"

    def run(self) -> list[Event]:
        notices: list[Event] = []
        site = get_site("/ys/")
        while True:
            query_string = f"[[分类:往期祈愿]]|?时间|?结束时间|?名称"
            res = site.api(
                action="ask",
                query=query_string,
                format="json",
            )
            resp = BiliWikiAskResponse(**res)
            if not resp.query.results:
                break
            with open(".temp/resp.json", "w", encoding="utf-8") as f:
                f.write(resp.model_dump_json())

        return notices
