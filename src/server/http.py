import os
import io
import json
import uvicorn
from fastapi import FastAPI, Request
from loguru import logger

app = FastAPI()


class HTTPServer:
    def __init__(
        self,
        host: str = "127.0.0.1",
        port: int = 8888,
    ) -> None:
        self.host = host
        self.port = port
        self.running = False
        self.server = None
        self.setup_routes()

    def setup_routes(self):
        @app.get("/")
        def hello_world():
            return {"success": "helloworld"}

    def start(self):
        self.running = True
        display_host = (
            self.host if self.host not in ["0.0.0.0", "127.0.0.1"] else "127.0.0.1"
        )
        logger.info(
            f"{self.__class__.__name__:<10} 启动，监听地址 http://{display_host}:{self.port}"
        )
        config = uvicorn.Config(
            app=app,
            host=self.host,
            port=self.port,
            reload=False,
            workers=1,
            log_config=None,
        )
        self.server = uvicorn.Server(config=config)
        self.server.run()

    def stop(self):
        self.running = False
        if self.server:
            self.server.should_exit = True
