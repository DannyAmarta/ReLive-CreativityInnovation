import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthPayload } from "./entities/auth.entity";
import { SignInInput } from "./dto/signInInput";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password";
import { ResetPasswordDto } from "./dto/reset-password";
import { ForgotResetPassword } from "./entities/forgot-reset-password.entity";

@Resolver()
export class AuthResolver{
    constructor(private readonly authService: AuthService){}

    @Mutation(()=> AuthPayload)
    async signIn(@Args("signInInput") signInInput: SignInInput){
        const user = await this.authService.validateLocalUser(signInInput)
        return await this.authService.login(user)
    }
    
    @Mutation(() => ForgotResetPassword)
    async forgotPassword(@Args('forgotInput') dto: ForgotPasswordDto) {
        return await this.authService.forgotPassword(dto.email);
    }

    @Mutation(() => ForgotResetPassword)
    async resetPassword(@Args('resetInput') dto: ResetPasswordDto) {
        return await this.authService.resetPassword(dto.token, dto.newPassword);
    }

    @Query(() => String)
    hello() {
        return "Hello World";
    }
}