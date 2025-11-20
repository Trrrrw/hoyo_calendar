FROM python:3.13.9-alpine AS runtime
LABEL authors="Trrrrw"

WORKDIR /app

RUN apk add --no-cache curl tzdata
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

COPY pyproject.toml uv.lock main.py /app/
COPY src /app/src/

RUN ~/.local/bin/uv sync --frozen

ENV PYTHONUNBUFFERED=1
ENV TZ=Asia/Shanghai
ENV SENDKEY=""

EXPOSE 8888
VOLUME ["/app/exports"]

CMD ["/root/.local/bin/uv", "run", "/app/main.py"]
