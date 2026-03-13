import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ForgotResetPassword{
    @Field()
    message: string;
}