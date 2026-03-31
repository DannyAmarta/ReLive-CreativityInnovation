import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(()=>Int)
    id!:number;

    @Field()
    name!: string;

    @Field()
    email!: string;

    @Field({nullable: true})
    bio?: string;

    @Field({nullable: true})
    avatar?: string;

    @Field()
    hasOpenRouterConnection!: boolean;

    @Field({nullable: true})
    openRouterKeyLabel?: string;

    @Field({nullable: true})
    openRouterConnectedAt?: Date;

    @Field({nullable: true})
    createdAt?: Date;
}
