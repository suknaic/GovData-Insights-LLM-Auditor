FROM mcr.microsoft.com/devcontainers/typescript-node:20

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-client \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
