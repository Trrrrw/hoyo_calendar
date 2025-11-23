from datetime import datetime
from pathlib import Path
from loguru import logger
from concurrent.futures import ThreadPoolExecutor, as_completed

from src.core.factory import (
    get_crawler,
    get_parser,
    get_exporter,
    get_all_games,
    EXPORTER_MAP,
)

# 通过这个列表控制是否限制导出类型
# 留空 = 自动导出所有 export 模块
ENABLED_EXPORTS: list[str] = []  # e.g. ["ics", "json"]

DEFAULT_OUTPUT_DIR = Path("exports")


def run_pipeline(game: str, output_dir: Path, export_formats: list[str]) -> None:
    logger.info(f"「{game}」")
    logger.info(f"开始运行任务")
    crawler = get_crawler(game)
    parser = get_parser(game)

    raw = crawler.fetch()
    notices = parser.parse(raw)
    output_dir.mkdir(parents=True, exist_ok=True)

    for fmt in export_formats:
        exporter = get_exporter(fmt)
        filename = Path(output_dir) / f"{game}_calendar.{fmt}"
        exporter.export(notices, filename)


def run_all_pipelines():
    print(f"{'-' * 25}{datetime.now()}{'-' * 25}")
    games = get_all_games()
    if not games:
        logger.warning("没有找到游戏，请仔细阅读文档说明，如有问题请在issues中提出")
        return

    # 自动发现所有导出器
    available_exports = sorted(EXPORTER_MAP.keys())

    # 若 ENABLED_EXPORTS 不为空，则用它作为过滤
    export_formats = ENABLED_EXPORTS if ENABLED_EXPORTS else available_exports

    logger.info(f"检测到游戏: {games}")
    logger.info(f"导出文件类型: {export_formats}")
    logger.opt(raw=True).info("\n")

    # for game in games:
    #     try:
    #         run_pipeline(game, DEFAULT_OUTPUT_DIR, export_formats)
    #     except Exception as e:
    #         logger.exception(f"任务运行失败 {game}: {e}")
    max_workers = min(8, len(games))
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(
                run_pipeline, game, DEFAULT_OUTPUT_DIR, export_formats
            ): game
            for game in games
        }

        for future in as_completed(futures):
            game = futures[future]
            try:
                future.result()
                logger.success(f"任务完成：{game}")
                print(f"{'-' * 25}{datetime.now()}{'-' * 25}")
            except Exception as e:
                logger.exception(f"任务失败：{game} — {e}")
            logger.opt(raw=True).info("\n")
