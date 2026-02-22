FROM ghcr.io/astral-sh/uv:python3.13-alpine AS runtime
LABEL authors="Trrrrw"

WORKDIR /src

COPY pyproject.toml uv.lock /src/
COPY app /src/app/

RUN uv sync --frozen

ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Shanghai
ENV output_folder="/src/release"

VOLUME ["/src/release"]

CMD ["uv", "run", "--env-file=.env", "-m", "app.main"]
