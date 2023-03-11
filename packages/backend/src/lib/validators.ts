import { z } from 'zod';

const minYearsAgo = new Date();
minYearsAgo.setFullYear(minYearsAgo.getFullYear() - 15);

const maxYearsAgo = new Date();
maxYearsAgo.setFullYear(maxYearsAgo.getFullYear() - 110);

export const UserValidatorObject = z
  .object({
    phone: z.string().min(10).max(15),
    firstName: z.string().min(2).max(32),
    lastName: z.string().min(2).max(32),
    sex: z.enum(['Male', 'Female', 'Other']),
    dateOfBirth: z
      .date()
      .max(minYearsAgo, { message: 'Too young, min 15' })
      .min(maxYearsAgo, { message: 'Too old, max 110' }),
    country: z.string(),
    city: z.string(),
    avatarUrl: z.string().url(),
    instagram: z.string().max(15),
    twitter: z.string().max(15),
    website: z.string().url(),
    bio: z.string().max(500),
  })
  .passthrough()
  .partial();

export type UserValidatorType = z.infer<typeof UserValidatorObject>;

export const validateUser = (
  input: UserValidatorType,
  required: Parameters<typeof UserValidatorObject.required>[0] = {},
) => {
  return UserValidatorObject.required(required).safeParse(input);
};
