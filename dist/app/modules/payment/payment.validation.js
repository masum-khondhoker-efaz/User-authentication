"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const CreateCheckoutSessionParams = zod_1.default.object({
    body: zod_1.default.object({
        amount: zod_1.default.number({
            required_error: 'Amount is required!',
        }),
    }),
});
exports.paymentValidation = { CreateCheckoutSessionParams };
