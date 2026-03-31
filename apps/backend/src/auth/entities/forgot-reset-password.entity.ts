import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ForgotResetPassword{
    @Field(() => String)
    message: string;
}