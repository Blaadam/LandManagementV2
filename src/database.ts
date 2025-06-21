import { PrismaClient } from '../generated/prisma';

export class databaseConnection {
    private static instance: databaseConnection;

    constructor() {
        if (databaseConnection.instance) {
            return databaseConnection.instance;
        }

        this.prisma = new PrismaClient();
        databaseConnection.instance = this;
    }

    cleanup() {
        this.prisma.$disconnect()
    }

    prisma: PrismaClient
}
