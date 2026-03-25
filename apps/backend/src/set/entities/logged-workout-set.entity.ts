import { Field, Float, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { SetFormulaId } from '../set.types';

@ObjectType()
export class LoggedWorkoutSet {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field()
  exerciseId: string;

  @Field()
  exerciseName: string;

  @Field(() => SetFormulaId)
  formulaUsed: SetFormulaId;

  @Field(() => Float, { nullable: true })
  weightLifted: number | null;

  @Field(() => Int, { nullable: true })
  actualReps: number | null;

  @Field(() => Int, { nullable: true })
  rirLogged: number | null;

  @Field(() => Float, { nullable: true })
  calculated1Rm: number | null;

  @Field()
  isCnsFatigue: boolean;

  @Field(() => Float, { nullable: true })
  durationMinutes: number | null;

  @Field(() => Float, { nullable: true })
  distanceMeters: number | null;

  @Field(() => Float, { nullable: true })
  rpeLogged: number | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
