import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    JwtModule.register({}),
    MailerModule
  ],
  providers: [UserResolver, UserService, PrismaService],
})
export class UserModule {}