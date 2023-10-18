
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'daniel@gmail.com', description: 'email del user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '20dejunio', description: 'password del user' })
  @IsString()
  password: string;
}