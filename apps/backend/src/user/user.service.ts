import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor (private prisma: PrismaService){}

  async create(createUserInput: CreateUserInput) {

    const existingUser = await this.prisma.user.findUnique({
      where: {email: createUserInput.email}  
    })

    if(existingUser){
      throw new BadRequestException('Email already registered')
    }

    const {password, ...user} = createUserInput;
    const hashedPassword = await hash(password);

    return this.prisma.user.create({
      data:{
        password: hashedPassword,
        ...user
      }
    })
  }
}
