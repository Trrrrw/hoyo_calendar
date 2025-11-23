import time
from typing import Any
from httpx import Client
from typing_extensions import Self
from contextlib import contextmanager


class MyClient(Client):
    _instance = None
    _default_params: dict[str, Any] = {
        "headers": {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate",
            "connection": "keep-alive",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
        },
        "timeout": 10.0,
    }

    def __new__(cls) -> Self:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if hasattr(self, "_initialized"):
            return
        super().__init__(**self._default_params)
        self._initialized = True
        self._overridden = False

    def _apply_default(self):
        self.headers.clear()
        self.headers.update(self._default_params["headers"])
        self.timeout = self._default_params["timeout"]

    def _apply_override(self, params):
        if "headers" in params:
            self.headers.update(params["headers"])
        if "timeout" in params:
            self.timeout = params["timeout"]

    def override(self, **params):
        self._overridden = True
        self._apply_override(params)

        @contextmanager
        def _ctx():
            try:
                yield self
            finally:
                self._apply_default()
                self._overridden = False

        return _ctx()

    def get(self, *args, **kwargs):
        while True:
            try:
                resp = super().get(*args, **kwargs)
                break
            except Exception as _:
                time.sleep(1)
        resp.raise_for_status()
        return resp

    def __enter__(self) -> Self:
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        if self._overridden:
            self._apply_default()
            self._overridden = False
