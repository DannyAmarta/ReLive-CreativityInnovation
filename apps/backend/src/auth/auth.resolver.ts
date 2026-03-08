import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthPayload } from "./entities/auth.entity";
import { SignInInput } from "./dto/signInInput";
import { AuthService } from "./auth.service";

@Resolver()
export class AuthResolver{
    constructor(private readonly authService: AuthService){}

    @Mutation(()=> AuthPayload)
    async signIn(@Args("signInInput") signInInput: SignInInput){
        const user = await this.authService.validateLocalUser(signInInput)
        return await this.authService.login(user)
    }
    
    @Query(() => String)
    hello() {
        return "Hello World";
    }
}