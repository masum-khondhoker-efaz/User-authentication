import z from 'zod';
const loginUser = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }),
  }),
});

const registerUser = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Name is required!',
    }),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }),
  }),
});

export const authValidation = { loginUser, registerUser };
