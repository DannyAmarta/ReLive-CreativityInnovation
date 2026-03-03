import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient

async function main(){
    const defaultPassword = await hash('123')
    const users = Array.from({length: 10}).map(()=>({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        password: defaultPassword
    }))

    await prisma.user.createMany({
        data: users
    })

    console.log("Seeding completed!")
}
main().then(()=>{
        prisma.$disconnect();
        process.exit(0);
    })
    .catch((e)=>{
        prisma.$disconnect();
        console.error(e)
        process.exit(1);
    })

    // npx tsx prisma/seed.ts