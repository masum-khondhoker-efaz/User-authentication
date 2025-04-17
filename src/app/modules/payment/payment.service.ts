import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken, refreshToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { verifyToken } from '../../utils/verifyToken';
import { PaymentStatus, User, UserRoleEnum, UserStatus } from '@prisma/client';
import Stripe from 'stripe';
import { CreateCheckoutSession } from './payment.interface';

const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

const PaymentService = async (
  payload: CreateCheckoutSession,
  userId: string,
  userEmail: string,
) => {
  if (payload.amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Amount must be greater than 0');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Payment for services',
          },
          unit_amount: Math.round(payload.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: userEmail,
    success_url: `${process.env.SERVER_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SERVER_URL}/payments/cancel`,
    metadata: {
      userId,
    },
  });

  await prisma.payment.create({
    data: {
      userId: userId.toString(),
      amount: payload.amount,
      currency: 'usd',
      status: PaymentStatus.PENDING,
      stripeId: session.id,
    },
  });

  return session;
};

const checkPaymentStatus = async (stripeId: string) => {
  // Step 1: Retrieve Checkout Session
  const session = await stripe.checkout.sessions.retrieve(stripeId);

  if (!session.payment_intent) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No payment intent found for this session',
    );
  }

  // Step 2: Retrieve Payment Intent
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent as string,
  );

  // Optionally validate if something critical is missing (e.g., unexpected status)
  if (!paymentIntent.status) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Unable to determine payment status',
    );
  }

  if (paymentIntent.status === 'succeeded') {
    await prisma.payment.update({
      where: { stripeId },
      data: { status: PaymentStatus.COMPLETED },
    });
  }

  return {
    status: paymentIntent.status, // 'succeeded', 'requires_payment_method', etc.
    amount_received: paymentIntent.amount_received / 100, // Convert cents to dollars
    currency: paymentIntent.currency,
  };
};
export const PaymentServices = {
  PaymentService,
  checkPaymentStatus,
};
