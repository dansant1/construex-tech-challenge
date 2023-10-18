import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'daniel@gmail.com', description: 'email del user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '20dejunio', description: 'password del user' })
  @IsString()
  @Length(8, 20)
  password: string;
}