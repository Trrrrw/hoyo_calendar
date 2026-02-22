import re


def camel_to_snake(name):
    """
    将驼峰命名转换为小写下划线形式
    例如: CamelCase -> camel_case, MyClassName -> my_class_name
    """
    # 在大写字母前插入下划线（除了开头）
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    # 在小写字母后的大写字母前插入下划线
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()
