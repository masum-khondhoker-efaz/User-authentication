import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken, refreshToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { User, UserRoleEnum, UserStatus } from '@prisma/client';
import { IUserFilterRequest, IUserLoginRequest } from './auth.interface';
import { verifyToken } from '../../utils/verifyToken';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const registerUserIntoDB = async (payload: IUserFilterRequest) => {
  if (payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new AppError(httpStatus.CONFLICT, 'User already exists!');
    }
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const userData = {
    ...payload,
    password: hashedPassword,
    role: UserRoleEnum.USER,
    status: UserStatus.ACTIVATE,
  };

  const result = await prisma.$transaction(async (transactionClient: any) => {
    const user = await transactionClient.user.create({
      data: userData,
    });
    if (!user) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created!');
    }

    const userWithOptionalPassword = user as UserWithOptionalPassword;
    delete userWithOptionalPassword.password;

    return user;
  });
  return result;
};

const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Profile;
};

const loginUserFromDB = async (payload: IUserLoginRequest) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVATE,
    },
  });
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!userData.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password is missing for this user',
    );
  }
  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect!');
  }
  const accessToken = await generateToken(
    {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  const refreshedToken = await refreshToken(
    {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    id: userData.id,
    name: userData.fullName,
    email: userData.email,
    role: userData.role,
    accessToken: accessToken,
    refreshToken: refreshedToken,
  };
};

const refreshTokenFromDB = async (refreshedToken: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token not found');
  }

  const decoded = await verifyToken(
    refreshedToken,
    config.jwt.refresh_secret as Secret,
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: (decoded as any).id,
      status: UserStatus.ACTIVATE,
    },
  });

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const newAccessToken = await generateToken(
    {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );

  const newRefreshToken = await refreshToken(
    {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Exporting the services for use in controllers
export const AuthServices = {
  registerUserIntoDB,
  getMyProfileFromDB,
  loginUserFromDB,
  refreshTokenFromDB,
};
