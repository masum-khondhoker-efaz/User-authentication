"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(config_1.default.stripe_secret_key, {
    apiVersion: '2025-03-31.basil',
    typescript: true,
});
const PaymentService = (payload, userId, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.amount <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Amount must be greater than 0');
    }
    const session = yield stripe.checkout.sessions.create({
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
    yield prisma_1.default.payment.create({
        data: {
            userId: userId.toString(),
            amount: payload.amount,
            currency: 'usd',
            status: client_1.PaymentStatus.PENDING,
            stripeId: session.id,
        },
    });
    return session;
});
const checkPaymentStatus = (stripeId) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Retrieve Checkout Session
    const session = yield stripe.checkout.sessions.retrieve(stripeId);
    if (!session.payment_intent) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'No payment intent found for this session');
    }
    // Step 2: Retrieve Payment Intent
    const paymentIntent = yield stripe.paymentIntents.retrieve(session.payment_intent);
    // Optionally validate if something critical is missing (e.g., unexpected status)
    if (!paymentIntent.status) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Unable to determine payment status');
    }
    if (paymentIntent.status === 'succeeded') {
        yield prisma_1.default.payment.update({
            where: { stripeId },
            data: { status: client_1.PaymentStatus.COMPLETED },
        });
    }
    return {
        status: paymentIntent.status, // 'succeeded', 'requires_payment_method', etc.
        amount_received: paymentIntent.amount_received / 100, // Convert cents to dollars
        currency: paymentIntent.currency,
    };
});
exports.PaymentServices = {
    PaymentService,
    checkPaymentStatus,
};
