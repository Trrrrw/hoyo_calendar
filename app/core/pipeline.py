from app.utils.logger import get_logger
from app.crawler.base_crawler import BaseCrawler
from app.exporter.base_exporter import BaseExporter


class Pipeline:
    logger = get_logger("PIPELINE")

    def __init__(self, crawler: BaseCrawler, exporters: list[BaseExporter]) -> None:
        self.crawler = crawler
        self.exporters = exporters

    def run(self):
        self.logger.info(self.crawler.cal_name)
        try:
            notices = self.crawler.run()
            self.logger.info(f" ├─获取到 {len(notices)} 条事件")
            for exporter in self.exporters:
                self.logger.info(f" ├─{exporter.__class__.__name__}")
                exporter.set_output_file(self.crawler.game_name, self.crawler.data_type)
                self.logger.info(f" │ ├─导出到 {exporter.output_file}")
                exporter.run(self.crawler.cal_name, notices)
                self.logger.success(" │ └─导出成功")
        except Exception:
            self.logger.exception("管道运行出错")
