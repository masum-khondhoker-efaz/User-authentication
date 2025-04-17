import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from '../auth/auth.service';
import { CLIENT_RENEG_LIMIT } from 'tls';

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'User registered successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const id = req.user.id;
  const result = await AuthServices.getMyProfileFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserFromDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const refreshToken = req.headers.authorization as string;
  const result = await AuthServices.refreshTokenFromDB(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Token refreshed successfully',
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  registerUser,
  getMyProfile,
  refreshToken,
};
