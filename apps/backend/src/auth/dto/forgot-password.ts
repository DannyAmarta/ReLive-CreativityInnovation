import { IsEmail } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ForgotPasswordDto {
  @Field()
  @IsEmail()
  email: string;
}