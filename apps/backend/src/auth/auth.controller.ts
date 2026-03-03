import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignInInput } from './dto/signInInput';
import { Args, Mutation } from '@nestjs/graphql';
import { AuthPayload } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Mutation(()=> AuthPayload)
  async signIn(@Args("signInInput") signInInput: SignInInput){
    const user = this.authService.validateLocalUser(signInInput)
    // return await this.authService
  }
  
}
