import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt } from 'class-validator';

@InputType()
export class ResolveRequestInput {
  @IsInt()
  @Field(() => Int)
  requestId: number;

  @IsEnum(['ACCEPT', 'REJECT'], { message: 'action must be ACCEPT or REJECT' })
  @Field()
  action: string;
}
