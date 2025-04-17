import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from '../auth/auth.controller';
import { authValidation } from '../auth/auth.validation';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/register',
  validateRequest(authValidation.registerUser),
  AuthControllers.registerUser,
);

router.get(
  '/me',
  auth(),
  AuthControllers.getMyProfile,
);

router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

router.post(
  '/refresh-token',
  auth(),
  AuthControllers.refreshToken,
);

export const AuthRouters = router;
