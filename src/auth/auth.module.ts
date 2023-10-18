import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginController } from './login.controller';
import { JwtService } from '../jwt/jwt.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../user/user.service';
@Module({
    providers: [
        AuthService, 
        JwtService,
        PrismaService,
        UsersService,
    ],
    controllers: [LoginController],
})
export class AuthModule {}

