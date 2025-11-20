from httpx import Client
from lxml import html
from loguru import logger

from src.crawler.base_crawler import BaseCrawler

QUERY = "[[分类:活动]]|?开始时间|?结束时间|?类型|?活动描述|?官方公告链接|?所属版本|?地区|template=活动一览/行|sort=开始时间|order=desc|limit=500|offset=0|headers=hide|searchlabel=|format=template|link=none"


class GenshinCrawler(BaseCrawler):
    """
    原神数据获取
    """

    def fetch(self) -> dict:
        logger.info("开始获取数据")
        url = "https://wiki.biligame.com/ys/api.php"
        params = {
            "action": "ask",
            "query": QUERY,
            "format": "json",
        }
        with Client(timeout=30.0) as client:
            resp = client.get(url=url, params=params)
            resp.raise_for_status()
            data = resp.json()

        # [DEBUG]
        from pathlib import Path

        Path("dist").mkdir(parents=True, exist_ok=True)
        with open("dist/ask.json", "w", encoding="utf-8") as f:
            import json

            json.dump(data, f, ensure_ascii=False, indent=4)
        logger.debug("action-ask 数据已缓存 dist/ask")

        name_to_image = self._fetch_cover()
        for title in data["query"]["results"].keys():
            data["query"]["results"][title]["printouts"]["封面"] = name_to_image.get(
                title, ""
            )
        return data

    def _fetch_cover(self) -> dict[str, str]:
        url = "https://wiki.biligame.com/ys/api.php"
        text = (
            """
{|class="wikitable sortable" style="width:100%;text-align:center"
|-
! class="headersort" style="width:20%" | 活动时间
! class="headersort" | 图
! class="headersort" style="width:20%" class="hidden-xs" | 名称
! class="headersort" style="width:10%" class="hidden-xs" | 类型
! class="headersort" class="hidden-xs" | 所属版本
|-{{#ask:
"""
            + QUERY
            + "}}|}"
        )
        params = {
            "action": "parse",
            "format": "json",
            "contentmodel": "wikitext",
            "text": text,
        }
        with Client() as client:
            resp = client.get(url=url, params=params)
            resp.raise_for_status()
            data = resp.json()

        # [DEBUG]
        with open("dist/parse.json", "w", encoding="utf-8") as f:
            import json

            json.dump(data, f, ensure_ascii=False, indent=4)
        with open("dist/parse.html", "w", encoding="utf-8") as f:
            f.write(data["parse"]["text"]["*"])
        logger.debug("action-parse 数据已缓存: dist/parse")

        html_text = data["parse"]["text"]["*"]
        tree = html.fromstring(html_text)
        rows = tree.xpath("//tr")
        name_to_image = {}
        for row in rows:
            imgs = row.xpath(".//img/@src")
            titles = row.xpath(".//a/@title")  # 活动名称
            if imgs and titles:
                name = titles[0].strip()
                name_to_image[name] = imgs[0]
        return name_to_image
