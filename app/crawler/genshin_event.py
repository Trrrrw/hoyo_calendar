from datetime import datetime

from app.crawler.base_crawler import BaseCrawler
from app.models.dto.bili_wiki_ask import BiliWikiAskResponse
from app.models.event import Event
from app.services.bili_wiki_helper import get_site


class GenshinEvent(BaseCrawler):
    @property
    def cal_name(self) -> str:
        return "原神活动日历"

    def run(self) -> list[Event]:
        notices: list[Event] = []
        site = get_site("/ys/")
        page = 0
        page_size = 150
        while True:
            query_string = f"[[分类:活动]]|?开始时间|?结束时间|?名称|?类型|?所属版本|?活动描述|?官方公告链接|sort=开始时间|order=desc|offset={page * page_size}|limit={page_size}"
            res = site.api(
                action="ask",
                query=query_string,
                format="json",
            )
            resp = BiliWikiAskResponse(**res)
            if not resp.query.results:
                break
            for result in resp.query.results.values():
                if not result.printouts["开始时间"] or not result.printouts["结束时间"]:
                    continue
                tags = result.printouts["类型"].copy()
                tags.extend(result.printouts["所属版本"])
                notices.append(
                    Event(
                        id=self.generate_id(result.printouts["名称"][0]),
                        title=result.printouts["名称"][0],
                        desc=result.printouts["活动描述"][0]
                        if result.printouts["活动描述"]
                        else "",
                        start=datetime.fromtimestamp(
                            int(result.printouts["开始时间"][0]["timestamp"])
                        ),
                        end=datetime.fromtimestamp(
                            int(result.printouts["结束时间"][0]["timestamp"])
                        ),
                        tags=tags,
                        url=result.printouts["官方公告链接"][0]
                        if result.printouts["官方公告链接"]
                        else "",
                    )
                )
            page += 1

        return notices
