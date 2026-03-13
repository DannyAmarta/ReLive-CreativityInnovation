import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsString()
  token: string;
  
  @Field()
  @IsString()
  @MinLength(6)
  newPassword: string;
}