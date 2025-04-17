import exp from 'constants';
import z from 'zod';

const CreateCheckoutSessionParams = z.object({
  body: z.object({
    amount: z.number({
      required_error: 'Amount is required!',
    }),
  }),
});

export const paymentValidation = { CreateCheckoutSessionParams };
