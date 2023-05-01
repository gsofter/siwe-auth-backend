# SIWE AUTH

<p align="center">
  This projected was bootstraped with [Nestjs](http://nestjs.com)
</p>

![image](https://user-images.githubusercontent.com/49583931/235481235-dff67f58-0119-443b-af88-873ebd4cc1c5.png)

## Getting started

### Prerequisites

To run the app on your local, you would need to setup followings before running the server.

- [Node.js > 16.17.1](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started)
- [Redis](https://redis.io/docs/getting-started/)
  - You can either create redis server on your local or use redis services. [Upstash](https://upstash.com/) is highly recommended to use free redis version.

### Installation

```bash
$ yarn install
```

### Configure environment

Clone `.env.example` to `.env` and configure following environment variables.

```
ALLOW_LIST=<ALLOW_ORIGIN_LIST>
JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>
PORT=<YOUR_SERVER_PORT>
REDIS_SERVER_URL=<REDIS_URL>
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Tech Stacks

- Used [NestJS](https://docs.nestjs.com/) as the web framework
- Used [SQLite](https://www.npmjs.com/package/sqlite3) as the database engine
- Used [TypeORM](https://typeorm.io/) as database ORM framework
- Used [SIWE](https://docs.login.xyz/sign-in-with-ethereum/quickstart-guide) protocol for authentication
- Used [Passport-JWT](https://docs.nestjs.com/recipes/passport#implementing-passport-jwt) to authenticate private endpoints
- Used [ioredis](https://www.npmjs.com/package/ioredis) to manage redis
