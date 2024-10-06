# Usar a imagem base do Python
FROM python:3.9-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o arquivo de requisitos (dependências)
COPY requirements.txt requirements.txt

# Instalar as dependências listadas no requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o conteúdo do projeto para o diretório de trabalho no container
COPY . .

# Definir a variável de ambiente para a porta que o Flask vai rodar
ENV PORT=8080

# Expor a porta 8080
EXPOSE 8080

# Comando para rodar o aplicativo Flask
CMD ["python", "main.py"]
