import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GeneratedRoutineEntryEntity {
  @Field()
  exercise: string;

  @Field(() => Int)
  sets: number;

  @Field(() => Int)
  reps: number;

  @Field(() => Float, { nullable: true })
  prescribedWeightKg: number | null;

  @Field()
  rationale: string;
}
