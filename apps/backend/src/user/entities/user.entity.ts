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

    @Field({nullable: true})
    createdAt?: Date;
}
