# Amigo Secreto

Esse projeto tem a intenção de sortear amigos para uma brincadeira chamada "Amigo secreto". 

Para a execução desse projeto é necessário Node v4.6.1 e uma conta no https://www.cloudamqp.com/ para o processamento
das requisições de sorteio.  

Após baixar o código, deve-se executar o seguinte comando: 

`npm install` 


Isto fará baixar e instalar todas as dependências do projeto. 

Após a instalação com sucesso e configurada as variáveis de ambiente, 

CLOUDAMQP_URL = url do serviço de filas CloudAMQ
QUEUE_PESSOA_UPDATE = nome da fila (pessoa_update) utilizada para fazer o processamento paralelo do sorteio.
MAILGUN_API = url do mailgun para envio de emails
MONGO_URL = url do banco de dados


basta executar o comando: 

`node run.js` ou `npm start` 

para executar o projeto e  `npm test` para execução dos testes unitários. 

