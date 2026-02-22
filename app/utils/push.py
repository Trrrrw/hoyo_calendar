import os
import re

from app.utils.logger import get_logger
from app.services.http_client import MyClient

logger = get_logger("PUSH")


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
    client = MyClient().override(headers=headers)
    response = client.post(url, json=params)
    result = response.json()
    if result.get("data", {}).get("error", "") == "SUCCESS":
        logger.success("消息发送成功")
    else:
        logger.error("消息发送失败")
    return result
