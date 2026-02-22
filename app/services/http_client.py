import time
from httpx import Client, Response, URL
from loguru import logger

log = logger.bind(name="HTTP_CLIENT")

HEADERS = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate",
    "connection": "keep-alive",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
}
TIMEOUT = 10


class MyClient(Client):
    def __init__(self, headers, timeout, *args, **kwargs):
        kwargs.setdefault("headers", HEADERS)
        kwargs.setdefault("timeout", TIMEOUT)
        super().__init__(
            *args,
            **kwargs,
        )

    def get(self, url: str | URL, *args, **kwargs) -> Response:
        while True:
            try:
                response = super().get(url, *args, **kwargs)
                time.sleep(0.5)
                return response
            except Exception:
                log.exception(f"请求失败：{url}，5秒后重试...")
                time.sleep(5)


client = MyClient(headers=HEADERS, timeout=TIMEOUT)
