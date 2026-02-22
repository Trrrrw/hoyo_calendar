import re
from datetime import datetime

from app.crawler.base_crawler import BaseCrawler
from app.models.birthday import Birthday
from app.models.dto.bili_wiki_ask import BiliWikiAskResponse
from app.services.bili_wiki_helper import get_site


class GenshinBirthday(BaseCrawler):
    @property
    def cal_name(self) -> str:
        return "原神生日日历"

    def run(self) -> list[Birthday]:
        notices: list[Birthday] = []
        site = get_site("/ys/")
        page = 0
        page_size = 150
        while True:
            query_string = f"[[分类:角色]]|?生日|?实装日期|offset={page * page_size}|limit={page_size}"
            res = site.api(
                action="ask",
                query=query_string,
                format="json",
            )
            resp = BiliWikiAskResponse(**res)
            if not resp.query.results:
                break
            for name, result in resp.query.results.items():
                if not result.printouts["生日"] or not result.printouts["实装日期"]:
                    continue
                elif (
                    result.printouts["生日"][0] == "与旅行者一致"
                    or result.printouts["生日"][0] == "（由玩家设置）"
                ):
                    month = 9
                    day = 15
                else:
                    month = int(result.printouts["生日"][0].split("月")[0])
                    day = int(result.printouts["生日"][0].split("月")[1].split("日")[0])

                release_date_str = re.search(
                    r"\d{4}年\d{1,2}月\d{1,2}日", result.printouts["实装日期"][0]
                ).group()

                notices.append(
                    Birthday(
                        id=self.generate_id(name),
                        name=name,
                        month=month,
                        day=day,
                        release_date=datetime.strptime(
                            release_date_str, "%Y年%m月%d日"
                        ),
                    )
                )
            page += 1

        return notices
