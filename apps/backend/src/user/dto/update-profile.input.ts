import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';

// This DTO carries optional fields for updating a user's display name and bio.
// Both fields are optional so the client can update just one at a time.
@InputType()
export class UpdateProfileInput {
  @IsOptional()
  @IsString()
  @Length(2, 80, { message: 'Name must be between 2 and 80 characters' })
  @Field(() => String, { nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Bio cannot exceed 255 characters' })
  @Field(() => String, { nullable: true })
  bio?: string;
}
