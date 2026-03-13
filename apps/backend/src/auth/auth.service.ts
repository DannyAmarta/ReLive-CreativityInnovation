import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';;
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInInput } from './dto/signInInput';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import path from 'path';
import * as fs from 'fs';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ){}

  // login
  async validateLocalUser({email, password}: SignInInput){
    const user = await this.prisma.user.findUnique({
      where:{
        email
      }
    })

    if(!user) throw new UnauthorizedException("User not found")

    const passwordMatched = await verify(user.password, password)
    if(!passwordMatched) {
      throw new UnauthorizedException("Invalid Credentials!")
    }

    return user
  }
  // jwt
  async generateToken(userId: number){
    const payload: AuthJwtPayload = {sub: userId};
    const accessToken = await this.jwtService.signAsync(payload);
    return {accessToken}
  }

  async login(user: User){
    const {accessToken} = await this.generateToken(user.id)
    return{
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken
    }
  }

  // jwt, kenapa harus rewrite karena payload isinya cuman user
  async validate(userId: number){
    const user = await this.prisma.user.findUnique({
      where:{
        id: userId
      }
    })
    if(!user){
      throw new UnauthorizedException('User not found')
    }
    // supaya cuman idnya aja kereturn lagi
    const currentUser = {id: user.id}
    return currentUser
  }

  // google passport
  async validateGoogleUser(googleUser: CreateUserInput){
    const user = await this.prisma.user.findUnique({
      where:{
        email: googleUser.email
      }
    })

    if(user){
      const {password, ...authUser} = user
      return authUser
    }

    const makeNewUserAccount = await this.prisma.user.create({
      data:{
        ...googleUser
      }
    })

    const {password, ...authUser} = makeNewUserAccount
    return authUser
  }
  
  async forgotPassword(email: string){
    const user = await this.prisma.user.findUnique({
      where:{
        email
      }
    })
    if(!user){
      return { message: "User email did not found please register first!" };
    }
    const token = await this.jwtService.signAsync(
      {sub: user.id},
      {expiresIn: '15m'}
    )

    const templatePath = path.join(
      process.cwd(),
      "src/mail/templates/resetPassword.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
    html = html.replace("{{resetLink}}", resetLink);
    html = html.replace("{{email}}", email);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      html: html
    })

    return{
      message: "Check your email to reset your password."
    }
  }

  async resetPassword(token: string, newPassword: string){
    let payload;
    try{
      payload = await this.jwtService.verifyAsync(token)
    } catch {
      throw new BadRequestException('Invalid or expired token')
    }

    const hashed = await hash(newPassword)

    await this.prisma.user.update({
      where:{id: payload.sub},
      data:{
        password: hashed
      }
    })

    return {
      message: 'Password updated successfully'
    }
  }

}
