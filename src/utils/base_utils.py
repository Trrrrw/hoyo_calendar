import os
import re
from loguru import logger

from src.services import MyClient


def clean_string(s: str) -> str:
    """清理换行符"""
    return s.replace("<br>", "").replace("\n", "")


def clean_bwiki_cover(url: str) -> str:
    """清理bwiki封面链接"""
    pattern = re.compile(
        r"^(https://patchwiki\.biligame\.com/images/ys)/thumb/([^/]+)/([^/]+)/([^/]+\.(?:png|jpg|jpeg|gif))(?:/.*)?$",
        re.IGNORECASE,
    )
    m = pattern.match(url)
    if not m:
        return url
    base, dir1, dir2, filename = m.groups()
    return f"{base}/{dir1}/{dir2}/{filename}"


def sc_send(title, desp="", options=None) -> dict:
    sendkey = os.getenv("SENDKEY", "")
    if not sendkey:
        logger.error("请正确配置sendkey https://sct.ftqq.com/sendkey")
    if options is None:
        options = {}
    # 判断 sendkey 是否以 'sctp' 开头，并提取数字构造 URL
    if sendkey.startswith("sctp"):
        match = re.match(r"sctp(\d+)t", sendkey)
        if match:
            num = match.group(1)
            url = f"https://{num}.push.ft07.com/send/{sendkey}.send"
        else:
            raise ValueError("Invalid sendkey format for sctp")
    else:
        url = f"https://sctapi.ftqq.com/{sendkey}.send"
    params = {"title": title, "desp": desp, **options}
    headers = {"Content-Type": "application/json;charset=utf-8"}
    with MyClient().override(headers=headers) as client:
        response = client.post(url, json=params)
        result = response.json()
    if result.get("data", {}).get("error", "") == "SUCCESS":
        logger.success("消息发送成功")
    else:
        logger.error("消息发送失败")
    return result
