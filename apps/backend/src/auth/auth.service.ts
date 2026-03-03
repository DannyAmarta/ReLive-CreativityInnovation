import { Injectable, UnauthorizedException } from '@nestjs/common';;
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInInput } from './dto/signInInput';
import { verify } from 'argon2';
import { User } from '@prisma/client';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private jwtService: JwtService
  ){}

  // resolver
  async validateLocalUser({email, password}: SignInInput){
    const user = await this.prisma.user.findUnique({
      where:{
        email
      }
    })

    if(!user) throw new UnauthorizedException("User not found")

    const passwordMatched = await verify(user.password, password)
    if(!passwordMatched) throw new UnauthorizedException("Invalid Credentials!")
    
      return user
  }
  async generateToken(userId: number){
    const payload: AuthJwtPayload = {sub: userId};
    const accessToken = await this.jwtService.signAsync(payload);
    return {accessToken}
  }

  async login(user: User){
    const {accessToken} = await this.generateToken(user.id)
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      accessToken
    }
  }
  // jwt
  async validate(userId: number){
    const user = await this.prisma.user.findUnique({
      where:{
        id: userId
      }
    })
    if(!user) throw new UnauthorizedException("User not found")
    
    const currentUserId = {id: user.id}
    return currentUserId
  }
}
