import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  Matches,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@InputType()
export class CreateAvailabilityRuleInput {
  /** 0=Sun … 6=Sat. Mutually exclusive with specificDate. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  @Field(() => Int, { nullable: true })
  dayOfWeek?: number;

  /** ISO date string for a date-specific override. Mutually exclusive with dayOfWeek. */
  @IsOptional()
  @IsDateString()
  @Field({ nullable: true })
  specificDate?: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:mm (24h)' })
  @Field()
  startTime: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:mm (24h)' })
  @Field()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  @Field({ defaultValue: true })
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field({ defaultValue: 'Asia/Jakarta' })
  timezone?: string;
}

@InputType()
export class UpdateAvailabilityRuleInput {
  @IsInt()
  @Field(() => Int)
  id: number;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:mm (24h)' })
  @Field({ nullable: true })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:mm (24h)' })
  @Field({ nullable: true })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  title?: string;
}
