import { Field } from "@nestjs/graphql";

export class AuthPayload {
    @Field()
    id: number;

    @Field()
    name: string;

    @Field({nullable: true})
    avatar?: string;

    @Field({nullable: true})
    accessToken: string;
}