import { Field } from "@nestjs/graphql";
import { IsString, MinLength } from "class-validator";

export class SignInInput{
    @Field()
    email: string;

    @Field()
    @IsString()
    @MinLength(1)
    password: string;
    
}