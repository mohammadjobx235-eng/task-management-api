
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;

  // نسخة وهمية من Prisma
  const mockPrismaService = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  // نسخة وهمية من خدمة JWT
  const mockJwtService = {
    signAsync: vi.fn(),
    sign: vi.fn(),
    verifyAsync: vi.fn(),
    verify: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
