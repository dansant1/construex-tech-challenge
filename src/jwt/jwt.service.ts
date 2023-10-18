import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secretKey: string = process.env.JWT_SIGN_KEY;

  sign(payload: any): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
  }

  verify(token: string) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
}
