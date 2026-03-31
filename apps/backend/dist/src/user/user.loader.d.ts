import DataLoader from 'dataloader';
import { NestDataLoader } from 'nestjs-dataloader';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
export declare class UserLoader implements NestDataLoader<number, User> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateDataLoader(): DataLoader<number, User>;
}
