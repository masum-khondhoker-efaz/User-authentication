import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';

const PaymentController = catchAsync(async (req, res) => {
  const user = req.user as any;
  console.log(user.id);
  const sessionUrl = await PaymentServices.PaymentService(
    req.body,
    user.id,
    user.email,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment session created successfully',
    data: sessionUrl,
  });
});

const getPaymentStatus = catchAsync(async (req, res) => {
  const { stripeId } = req.params;

  const statusData = await PaymentServices.checkPaymentStatus(stripeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment status fetched successfully',
    data: statusData,
  });
});

export const PaymentControllers = {
  PaymentController,
  getPaymentStatus,
};
