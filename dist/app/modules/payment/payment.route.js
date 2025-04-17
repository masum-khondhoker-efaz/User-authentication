"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouters = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const payment_controller_1 = require("./payment.controller");
const payment_validation_1 = require("./payment.validation");
const router = express_1.default.Router();
router.post('/checkout', (0, auth_1.default)(), (0, validateRequest_1.default)(payment_validation_1.paymentValidation.CreateCheckoutSessionParams), payment_controller_1.PaymentControllers.PaymentController);
router.get('/status/:stripeId', (0, auth_1.default)(), payment_controller_1.PaymentControllers.getPaymentStatus);
exports.PaymentRouters = router;
