from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class ProjectSettings(BaseSettings):
    """使用 pydantic_settings 管理项目配置"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,  # 环境变量不区分大小写
        extra="ignore",  # 忽略未定义的字段
    )

    debug: bool = Field(default=False, description="调试模式")
    log_level: str = Field(default="INFO", description="日志级别")
    output_folder: str = Field(default="./release", description="输出文件夹")


settings = ProjectSettings()
