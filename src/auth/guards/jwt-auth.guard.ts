import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '../../jwt/jwt.service'; 

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const jwtToken = token.split(' ')[1];
    try {
      const userData = this.jwtService.verify(jwtToken);
      request.user = userData;
      return true;
    } catch (error) {
      console.log('error=', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
