from zlib import crc32
from datetime import datetime
from loguru import logger

from .base_parser import BaseParser
from src.models import Notice
from src.utils import clean_string, clean_bwiki_cover, sc_send


class GenshinParser(BaseParser):
    """
    原神数据整理
    """

    def parse(self, raw_data) -> list[Notice]:
        logger.info("开始整理数据")
        raw_notices: dict[str, dict] = raw_data["query"]["results"]
        notice_list: list[Notice] = []
        for key, value in raw_notices.items():
            notice = Notice(
                id=self.parse_id(key),
                title=self.parse_title(key),
                desc=self.parse_desc(value),
                cover=self.parse_cover(value),
                start=self.parse_start(value),
                end=self.parse_end(value),
                tag=self.parse_tag(value),
                official=self.parse_official(value),
                version=self.parse_version(value),
            )

            # [DEBUG]
            if notice.has_empty_field():
                import json
                from pathlib import Path
                from pydantic.json import pydantic_encoder

                json_file = Path("dist/empty_notice.json")
                json_file.parent.mkdir(parents=True, exist_ok=True)
                empty_notice = {}
                if json_file.exists():
                    with open(json_file, "r", encoding="utf-8") as f:
                        empty_notice = json.load(f)
                empty_notice[notice.title] = notice
                with open(json_file, "w", encoding="utf-8") as f:
                    json.dump(
                        empty_notice,
                        f,
                        default=pydantic_encoder,
                        ensure_ascii=False,
                        indent=4,
                    )

            notice_list.append(notice)
        notice_list = super().sort_notice(notice_list)
        logger.success(f"共整理{len(notice_list)}个数据")
        return notice_list

    def parse_id(self, key: str) -> str:
        return f"{crc32(key.encode('utf-8')) & 0xffffffff:08x}"

    def parse_title(self, key: str) -> str:
        return key

    def parse_desc(self, value: dict) -> str:
        desc: list[str] = []
        if value.get("printouts", {}).get("活动描述", []):
            desc.append(clean_string(value.get("printouts", {}).get("活动描述", [])[0]))
        if value.get("printouts", {}).get("官方公告链接", []):
            desc.append(
                clean_string(value.get("printouts", {}).get("官方公告链接", [])[0])
            )
        else:
            desc.append(value.get("fullurl", ""))
        if value.get("printouts", {}).get("类型", []):
            desc.append(",".join(value.get("printouts", {}).get("类型", [])))
        return "\\n\\n".join(desc)

    def parse_cover(self, value: dict) -> str:
        origin_cover = value.get("printouts", {}).get("封面", "")
        return clean_bwiki_cover(origin_cover)

    def parse_start(self, value: dict) -> datetime:
        origin_start = value.get("printouts", {}).get("开始时间", [])
        if not origin_start or "raw" not in origin_start[0]:
            return datetime.fromtimestamp(0)
        raw_value = origin_start[0]["raw"]
        patterns = [
            "%w/%Y/%m/%d/%H/%M/%S/%f",
            "%w/%Y/%m/%d",
        ]
        for pattern in patterns:
            try:
                return datetime.strptime(raw_value, pattern)
            except ValueError:
                continue
        return datetime.fromtimestamp(0)

    def parse_end(self, value: dict) -> datetime:
        origin_end = value.get("printouts", {}).get("结束时间", [])
        try:
            return datetime.strptime(origin_end[0]["raw"], "%w/%Y/%m/%d/%H/%M/%S/%f")
        except Exception as e:
            return datetime.fromtimestamp(0)

    def parse_tag(self, value: dict) -> list[str]:
        type = value.get("printouts", {}).get("类型", [])
        area = value.get("printouts", {}).get("地区", [])
        type.extend(area)
        return type

    def parse_official(self, value: dict) -> str:
        if origin_official := value.get("printouts", {}).get("官方公告链接", []):
            return origin_official[0]
        else:
            return ""

    def parse_version(self, value: dict) -> list[str]:
        return value.get("printouts", {}).get("所属版本", [])
