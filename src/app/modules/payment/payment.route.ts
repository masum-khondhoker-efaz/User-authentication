import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { PaymentControllers } from './payment.controller';
import { paymentValidation } from './payment.validation';

const router = express.Router();

router.post(
  '/checkout',
  auth(),
  validateRequest(paymentValidation.CreateCheckoutSessionParams),
  PaymentControllers.PaymentController,
);

router.get('/status/:stripeId', auth(), PaymentControllers.getPaymentStatus);

export const PaymentRouters = router;
