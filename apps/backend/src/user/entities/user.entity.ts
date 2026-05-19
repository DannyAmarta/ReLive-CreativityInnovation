import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(() => Int)
    id!: number;

    @Field()
    name!: string;

    @Field()
    email!: string;

    @Field()
    role!: string;

    @Field({ nullable: true })
    bio?: string;

    @Field({ nullable: true })
    avatar?: string;

    // --- Add these for Onboarding & Vitality ---
    @Field()
    profileCompleted!: boolean;

    @Field({ nullable: true })
    fitnessLevel?: string;

    @Field({ nullable: true })
    dailyActivity?: string;

    @Field({ nullable: true })
    primaryGoal?: string;

    @Field(() => Int)
    vitalityScore!: number;

    @Field(() => Int)
    streakDays!: number;
    // ------------------------------------------

    @Field()
    hasOpenRouterConnection!: boolean;

    @Field({ nullable: true })
    openRouterKeyLabel?: string;

    @Field({ nullable: true })
    openRouterConnectedAt?: Date;

    @Field({ nullable: true })
    createdAt?: Date;
}
