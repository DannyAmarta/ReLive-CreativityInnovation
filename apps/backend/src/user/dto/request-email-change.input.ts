import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class RequestEmailChangeInput {
  @Field()
  @IsEmail()
  newEmail!: string;

  // The current password is required for local accounts. Google OAuth users skip this.
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  // When true, proceed to overwrite the alternate account that already holds newEmail.
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  overwriteAlternate?: boolean;
}
