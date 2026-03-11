import { faker } from '@faker-js/faker';
import { hash } from 'argon2';
import { PrismaClient } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserInput } from 'src/user/dto/create-user.input';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await hash('123');
  const users = Array.from({ length: 10 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    bio: faker.lorem.sentence(),
    password: defaultPassword,
  }));

  await prisma.user.createMany({
    data: users,
  });

  console.log('Seeding completed!');
}
main()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((e) => {
    prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });

// npx tsx prisma/seed.ts
