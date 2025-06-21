import Client from "./client";
require("dotenv").config();

import { databaseConnection } from "./database";
const connection = new databaseConnection();

const BOT_SECRET = process.env.BOT_SECRET;

new Client().login(BOT_SECRET);

function cleanup() {
    connection.cleanup();
}

process.on("exit", cleanup);
process.on('uncaughtException', cleanup);