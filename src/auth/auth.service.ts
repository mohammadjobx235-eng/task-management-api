
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}


  async register(dto: RegisterDto) {

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    
    const user = await this.prisma.user.create({
      data: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        createdAt: true,
      },
    });

    
    return {
      message: 'Registration successful',
      user,
    };
  }

  
  async login(dto: LoginDto) {
   
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

   
    if (
      !user ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

   
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    // إرجاع التوكن وبيانات المستخدم الآمنة
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    };
  }
}
