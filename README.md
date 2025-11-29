# CommerceServiceDesk

CommerceServiceDesk is a repository that contains all the necessary code for the Firestone Department of Commerce's Discord Bot, designed to improve departmental workflow and support.

## Built With

- **[Just](https://github.com/casey/just)**: A handy command runner for automating repetitive tasks.
- **[TypeScript](https://www.typescriptlang.org/)**: JavaScript with syntax for types.
- **[SapphireJS](https://sapphirejs.dev/)**: An object-orientated Discord.js bot framework.
- **[Discord.js](https://discord.js.org/)**: Powerful Node.js module that allows you to interact with the Discord API very easily.
- **[Prisma ORM](https://www.prisma.io/orm)**: Next-generation Node.js and TypeScript ORM.
- **[Docker](https://www.docker.com/)**: Build, secure, share, and run agents and apps on the container platform trusted by 20M+ developers.

## Getting Started

Ensure that [NodeJS](https://nodejs.org/en) is installed
Ensure that TypeScript is downloaded globally through:

```ps1
npm install -g typescript
```

Install all the dependencies

```ps1
npm install
```

If a new table has been added to or altered in database, ensure to pull.

```ps1
npx prisma db pull
```

Generate the prisma client

```ps1
npx prisma generate
```

If you want to push to a database, you migrate the database

```ps1
npx prisma migrate dev --name "NAME HERE"
```

Copy the `docker-compose.yml` file, create an overriding compose file, and ensure the following environment variables are updated:

```ini
- NODE_ENV=development
# Bot credentials
- MAIN_GUILD_ID=123456789012345678
- BOT_CLIENT_ID=123456789012345678
- BOT_SECRET=your_bot_secret_here

# MariaDB credentials
- MARIADB_HOST=192.168.xxx.xxx
- MARIADB_PORT=3306
- MARIADB_USER=your_db_user
- MARIADB_PASSWORD=your_db_password
- MARIADB_DATABASE=your_db_name

# Prisma configuration
- DATABASE_URL=mysql://your_db_user:your_db_password@192.168.xxx.xxx:3306/your_db_name

# Trello API
- TRELLO_KEY=your_trello_key
- TRELLO_TOKEN=your_trello_token
```

## Running with Docker

```ps1
docker compose -f docker-compose-dev.yml up --build
```

or,

```ps1
just docker-dev
```

## Configure the project (if necessary)

Use the command to configure the project to only accept typescript, if necessary.

```ps1
npm i typescript --save-dev
```

Use the tsc init command to establish a tsconfig.json file:

```ps1
npx tsc --init
```

## Compile & Run

```ps1
tsc
node .
```

or,

```ps1
just cleanbuild
```
