import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
    @Field()
    id: number;

    @Field(() => String)
    name: string;

    @Field(() => String, {nullable: true})
    avatar?: string;

    @Field(() => String, {nullable: true})
    accessToken: string;
}