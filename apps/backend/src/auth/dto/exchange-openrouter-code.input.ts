import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class ExchangeOpenRouterCodeInput {
  @Field()
  @IsString()
  @Length(8, 512)
  code!: string;

  @Field()
  @IsString()
  @Length(43, 512)
  verifier!: string;
}
