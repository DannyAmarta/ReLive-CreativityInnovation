import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { dot } from 'node:test/reporters';
import { MailerService } from '@nestjs-modules/mailer';

// html
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class UserService {
  constructor (
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailerService
  ){}

  // async create(createUserInput: CreateUserInput) {

  //   const existingUser = await this.prisma.user.findUnique({
  //     where: {email: createUserInput.email}  
  //   })

  //   if(existingUser){
  //     throw new BadRequestException('Email already registered')
  //   }

  //   const {password, ...user} = createUserInput;
  //   const hashedPassword = await hash(password);

  //   return this.prisma.user.create({
  //     data:{
  //       password: hashedPassword,
  //       ...user
  //     }
  //   })
    
  // }

  async generateActivationToken(dto: CreateUserInput){

    const payload = {
      email: dto.email,
      password: dto.password,
      name: dto.name
    }

    const token = await this.jwtService.signAsync(payload,{
      secret: process.env.EMAIL_SECRET,
      expiresIn: "15m"
    })

    return token
}

  // tembak trigger email
  async register(dto: CreateUserInput){
    
    const existingUser = await this.prisma.user.findUnique({
      where: {email: dto.email}  
    })
    if(existingUser){
      throw new BadRequestException('Email already registered')
    }

    const hashedPassword = await hash(dto.password)
    const token = await this.generateActivationToken({
      ...dto,
      password: hashedPassword
    })

    const templatePath = path.join(
      process.cwd(),
      "src/mail/templates/mail.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    // ga boleh / di belakang, token bisa rusak
    const activationLink = `http://localhost:8000/auth/activate?token=${token}`
    html = html.replace("{{activationLink}}", activationLink);
    html = html.replace("{{dtoEmail}}", dto.email);
    // console.log("Activation link", activationLink)
    await this.mailService.sendMail({
        to: dto.email,
        subject: "Activate your account",
        html: html
    })

    return{
      message: "Check your email to activate account."
    }
  }

  
}
