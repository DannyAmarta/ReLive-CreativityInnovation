import { Body, Controller, Get, Post, Query, Request, Res, UseGuards } from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { AuthService } from "./auth.service";
import type { Response } from "express";
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "src/prisma/prisma.service";
import { ForgotPasswordDto } from "./dto/forgot-password";
import { ResetPasswordDto } from "./dto/reset-password";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ){}

    @UseGuards(GoogleAuthGuard)
    @Get('google/login')
    googleLogin(){}

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async googleCallback(@Request() req, @Res() res: Response){
        console.log("user googleCallback", req.user)
        const userData = await this.authService.login(req.user)

        res.redirect(`http://localhost:3000/api/auth/google/callback?userId=${userData.id}&name=${userData.name}&avatar=${userData.avatar}&accessToken=${userData.accessToken}`)
    
    }

    @Get('activate')
    async activate(@Query('token') token: string, @Res() res: Response){
        const payload = await this.jwtService.verifyAsync(token,{
            secret: process.env.EMAIL_SECRET
        })
        const user = await this.prisma.user.create({
            data:{
                email: payload.email,
                password: payload.password,
                name: payload.name
            }
        })
        return res.redirect("http://localhost:3000/auth/login")
    }

    // @Post('forgot-password')
    // forgotPassword(@Body() dto: ForgotPasswordDto) {
    //     return this.authService.forgotPassword(dto.email);
    // }

    // @Post('reset-password')
    // resetPassword(@Body() dto: ResetPasswordDto) {
    //     return this.authService.resetPassword(dto.token, dto.newPassword);
    // }

}