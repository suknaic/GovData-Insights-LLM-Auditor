# imagem oficial da Microsoft otimizada para Dev Containers e Python
FROM mcr.microsoft.com/devcontainers/python:3.11

# Evita interações travando o terminal durante a instalação
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependências do sistema operacional necessárias para compilar bibliotecas e conectar ao Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# (Opcional) Poetry se você preferir ele ao invés do pip/requirements.txt
RUN curl -sSL https://install.python-poetry.org | python3 -

# variáveis de ambiente do Python otimizadas
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1