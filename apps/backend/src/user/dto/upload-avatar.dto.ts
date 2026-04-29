import { IsNotEmpty, IsString } from 'class-validator';

export class UploadAvatarDto {
  @IsNotEmpty()
  @IsString()
  userId!: string; // FormData sends everything as strings
}