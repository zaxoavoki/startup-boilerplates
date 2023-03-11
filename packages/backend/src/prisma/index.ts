import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const disconnectFromDatabase = () => prisma.$disconnect();
export const connectToDatabase = () => prisma.$connect();
