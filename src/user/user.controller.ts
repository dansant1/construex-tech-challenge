import { Controller, Post, Body, UsePipes, ValidationPipe, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiCreatedResponse, ApiBadRequestResponse, ApiBody } from '@nestjs/swagger';

@Controller('user')
@ApiTags('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBody({ type: CreateUserDto }) 
  @ApiBadRequestResponse({ description: 'Bad request' })
  @UsePipes(new ValidationPipe())
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const user = await this.usersService.createUser(email, password);
      return { message: 'User registered successfully', user };
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation (duplicate email)
        throw new ConflictException('Email is already in use');
      } else {
        console.log(error.message);
        throw new InternalServerErrorException('Failed to register user');
      }
    }
  }
}

