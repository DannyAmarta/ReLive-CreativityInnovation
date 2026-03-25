import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { NestDataLoader } from 'nestjs-dataloader';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserLoader implements NestDataLoader<number, User> {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(): DataLoader<number, User> {
    return new DataLoader<number, User>(async (keys) => {
      // Execute EXACTLY one query regardless of how deeply nested the GraphQL request is.
      const users = await this.prisma.user.findMany({
        where: { id: { in: [...keys] } },
      });
      
      const userMap = new Map(users.map((user) => [user.id, user]));
      
      // Map results back to the original key order so Dataloader aligns them correctly
      return keys.map((key) => {
        const user = userMap.get(key);
        return user ?? new Error(`User ${key} not found`);
      });
      
    });
  }
}
