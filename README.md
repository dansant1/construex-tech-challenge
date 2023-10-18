# Construex Technical Challenge

To Do API.

## Requisitos previos

Asegúrate de tener instaladas las siguientes herramientas y dependencias antes de comenzar:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) (normalmente se instala junto con Node.js)

## Configuración

1. Clona este repositorio en tu máquina local:

```shell
   git clone https://github.com/dansant1/construex-tech-challenge.git
   cd construex-tech-challenge
```

2. Crea un archivo .env en la raíz del proyecto y configura tus variables de entorno
```shell
DATABASE_URL=postgresql://gqbcuhhtuzirgfv:passwordmaster@mydbinstance.cx8veodvooht.us-east-2.rds.amazonaws.com:5432/mydb?schema=public
JWT_SIGN_KEY=mysecretkey

REDIS_USERNAME=default
REDIS_PASSWORD=rsJMONoI7ULugvs4iTrVq0HUsUVmXJyA
REDIS_HOST=redis-19662.c16.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=19662
```

3. Construye y ejecuta los servicios de Docker para PostgreSQL, Redis y tu aplicación NestJS
```shell
docker-compose up -d
```

4. Ejecuta las migraciones de Prisma para configurar la base de datos
```shell
docker exec -it nest-app npm run prisma:migrate
```

5. Para iniciar tu aplicación, utiliza el siguiente comando
```shell
docker exec -it nest-app npm run start:dev
```
Tu aplicación estará disponible en http://localhost:3000

Documentación API
Puedes acceder a la documentación de la API en http://localhost:3000/docs

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](LICENSE).
