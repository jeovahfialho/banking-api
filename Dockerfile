# Usar uma imagem base Node.js oficial
FROM node:18-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar o código fonte da aplicação
COPY . .

# Expor a porta que a aplicação utiliza
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"]