import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { AuthServices } from './auth.service';
import { UserStatus } from '@prisma/client';
import { generateToken } from '../../utils/generateToken';

// Mock the external dependencies
jest.mock('bcrypt');
jest.mock('../../utils/generateToken');

// Mock Prisma client
jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Import the mocked Prisma after defining the mock
import prisma from '../../utils/prisma';
import AppError from '../../errors/AppError';

describe('AuthServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUserIntoDB', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        status: UserStatus.ACTIVATE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
        });
      });

      const result = await AuthServices.registerUserIntoDB({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(result).toEqual(mockUser);
    });

    it('should throw conflict error if user already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'test@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        AuthServices.registerUserIntoDB({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.CONFLICT, 'User already exists!'),
      );
    });

    it('should throw error if user creation fails', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(
        AuthServices.registerUserIntoDB({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, 'User not created!'),
      );
    });
  });

  describe('loginUserFromDB', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'USER',
        status: UserStatus.ACTIVATE,
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockResolvedValue('mockAccessToken');

      const result = await AuthServices.loginUserFromDB({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          status: UserStatus.ACTIVATE,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        accessToken: 'mockAccessToken',
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        AuthServices.loginUserFromDB({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    });

    it('should throw error if password is missing', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: null,
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthServices.loginUserFromDB({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new AppError(
          httpStatus.BAD_REQUEST,
          'Password is missing for this user',
        ),
      );
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthServices.loginUserFromDB({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, 'Password incorrect!'),
      );
    });
  });

  describe('getMyProfileFromDB', () => {
    it('should return user profile successfully', async () => {
      const mockProfile = {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUniqueOrThrow as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const result = await AuthServices.getMyProfileFromDB('1');

      expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw error if profile not found', async () => {
      (prisma.user.findUniqueOrThrow as jest.Mock).mockRejectedValue(
        new Error('Profile not found'),
      );

      await expect(
        AuthServices.getMyProfileFromDB('nonexistent-id'),
      ).rejects.toThrow('Profile not found');
    });
  });
});
