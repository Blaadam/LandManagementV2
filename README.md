# LandManagementV2

LandManagementV2 is a repository that contains all the necessary code for the Firestone Department of Commerce's Discord Bot.

## Built With

- **[Just](https://github.com/casey/just)**: A handy command runner for automating repetitive tasks.
- **[TypeScript](https://www.typescriptlang.org/)**: JavaScript with syntax for types.
- **[SapphireJS](https://sapphirejs.dev/)**: An object-orientated Discord.js bot framework.
- **[Discord.js](https://discord.js.org/)**: Powerful Node.js module that allows you to interact with the Discord API very easily.
- **[Prisma ORM](https://www.prisma.io/orm)**: Next-generation Node.js and TypeScript ORM.

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

Ensure that a `.env` file exists, with the following data:

```ini
# Bot credentials
BOT_CLIENT_ID="BOT CLIENT ID HERE"
BOT_SECRET="BOT SECRET HERE"

# MariaDB credentials
MARIADB_HOST="192.168.0.0"
MARIADB_PORT="3306"
MARIADB_USER="MARIADB USER HERE"
MARIADB_PASSWORD="MARIADB USER PASSWORD HERE"
MARIADB_DATABASE="MARIADB DATABASE HERE"

# Prisma configuration
DATABASE_URL="mysql:// CONNECTION STRING HERE"

# Trello API
TRELLO_API_KEY="TRELLO API KEY HERE"
TRELLO_API_TOKEN="TRELLO API TOKEN HERE"
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

## TODO

1. Setup AWS VPC
2. Setup
