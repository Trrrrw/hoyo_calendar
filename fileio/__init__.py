import json
import yaml
import os
import aiofiles


class File:
    def __init__(self, path: str):
        self.path: str = os.path.abspath(path)
        directory_path = os.path.dirname(self.path)
        if not os.path.isdir(directory_path):
            os.makedirs(directory_path)

    def write(self, content: str | int | bytes | dict):
        filename, file_extension = os.path.splitext(self.path)
        match file_extension:
            case '.json':
                with open(self.path, 'w', encoding='utf-8') as f:
                    json.dump(content, f, ensure_ascii=False)
            case '.yaml' | '.yml':
                with open(self.path, 'w', encoding='utf-8') as f:
                    yaml.dump(content, f, default_flow_style=False, allow_unicode=True)
            case _:
                if isinstance(content, bytes):
                    with open(self.path, 'wb') as f:
                        f.write(content)
                elif isinstance(content, str) or isinstance(content, int):
                    with open(self.path, 'w', encoding='utf-8') as f:
                        f.write(str(content))
                else:
                    raise TypeError(f'Unsupported type: {type(content)}')

    def read(self, encoding: str = 'utf-8'):
        if not os.path.exists(self.path) or os.path.getsize(self.path) == 0:
            return None
        filename, file_extension = os.path.splitext(self.path)
        match file_extension:
            case '.json':
                with open(self.path, 'r', encoding=encoding) as f:
                    return json.load(f)
            case '.yaml' | '.yml':
                with open(self.path, 'r', encoding=encoding) as f:
                    return yaml.safe_load(f)
            case '.jpg' | '.jpeg' | '.png' | '.gif' | '.bmp' | '.tiff':
                with open(self.path, 'rb') as f:
                    return f.read()
            case _:
                with open(self.path, 'r', encoding=encoding) as f:
                    return f.read()

    async def write_async(self, content: str | int | bytes | dict):
        filename, file_extension = os.path.splitext(self.path)
        match file_extension:
            case '.json':
                async with aiofiles.open(self.path, 'w', encoding='utf-8') as f:
                    await f.write(json.dumps(content, ensure_ascii=False))
            case '.yaml' | '.yml':
                async with aiofiles.open(self.path, 'w', encoding='utf-8') as f:
                    await f.write(yaml.dump(content, default_flow_style=False, allow_unicode=True))
            case _:
                if isinstance(content, bytes):
                    async with aiofiles.open(self.path, 'wb') as f:
                        await f.write(content)
                elif isinstance(content, str) or isinstance(content, int):
                    async with aiofiles.open(self.path, 'w', encoding='utf-8') as f:
                        await f.write(str(content))
                else:
                    raise TypeError(f'Unsupported type: {type(content)}')

    async def read_async(self, encoding: str = 'utf-8'):
        if not os.path.exists(self.path) or os.path.getsize(self.path) == 0:
            return None
        filename, file_extension = os.path.splitext(self.path)
        match file_extension:
            case '.json':
                async with aiofiles.open(self.path, 'r', encoding=encoding) as f:
                    return json.loads(await f.read())
            case '.yaml' | '.yml':
                async with aiofiles.open(self.path, 'r', encoding=encoding) as f:
                    return yaml.safe_load(await f.read())
            case '.jpg' | '.jpeg' | '.png' | '.gif' | '.bmp' | '.tiff' | '.webp':
                async with aiofiles.open(self.path, 'rb') as f:
                    return await f.read()
            case _:
                async with aiofiles.open(self.path, 'r', encoding=encoding) as f:
                    return await f.read()
