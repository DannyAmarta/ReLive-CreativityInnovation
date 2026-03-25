import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SetExerciseCategory, SetFormulaId } from '../set.types';

registerEnumType(SetExerciseCategory, {
  name: 'SetExerciseCategory',
});

registerEnumType(SetFormulaId, {
  name: 'SetFormulaId',
});

@ObjectType()
export class SetExercise {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => SetExerciseCategory)
  category: SetExerciseCategory;

  @Field(() => SetFormulaId)
  formula: SetFormulaId;

  @Field()
  description: string;

  @Field(() => Int, { nullable: true })
  repCap: number | null;

  @Field(() => [String])
  requiredMetrics: string[];
}
