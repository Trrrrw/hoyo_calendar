import importlib, pkgutil
from src.crawler.base_crawler import BaseCrawler
from src.parser.base_parser import BaseParser
from src.exporter.base_exporter import BaseExporter
from src.crawler import __path__ as crawler_path
from src.parser import __path__ as parser_path
from src.exporter import __path__ as exporter_path


def discover_modules(package_path, base_class, suffix):
    discovered = {}
    for _, module_name, _ in pkgutil.iter_modules(package_path):
        if module_name.startswith("base_"):
            continue
        module = importlib.import_module(f"src.{suffix}.{module_name}")
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if (
                isinstance(attr, type)
                and issubclass(attr, base_class)
                and attr is not base_class
            ):
                key = module_name.replace(f"_{suffix}", "")
                discovered[key] = attr
    return discovered


CRAWLER_MAP = discover_modules(crawler_path, BaseCrawler, "crawler")
PARSER_MAP = discover_modules(parser_path, BaseParser, "parser")
EXPORTER_MAP = discover_modules(exporter_path, BaseExporter, "exporter")


def get_all_games():
    """获取所有注册的游戏名"""
    return sorted(set(CRAWLER_MAP.keys()) & set(PARSER_MAP.keys()))


def get_crawler(game):
    return CRAWLER_MAP[game]()


def get_parser(game):
    return PARSER_MAP[game]()


def get_exporter(fmt):
    return EXPORTER_MAP[fmt]()
