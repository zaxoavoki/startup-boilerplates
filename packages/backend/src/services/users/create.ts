import { auth } from 'firebase-admin';
import { isNil, omitBy } from 'lodash';

import { CreateUserInput } from '../../../generated/graphql';
import { validateUser } from '../../lib/validators';
import { prisma } from '../../prisma';

export const createUser = async (
  input: CreateUserInput,
  user: auth.UserRecord,
) => {
  const validated = validateUser(
    omitBy(input, isNil),
    omitBy(
      {
        ...input,
        phone: undefined,
      },
      isNil,
    ),
  );

  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      phone: validated.data.phone,
    },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  return prisma.user.create({
    data: {
      ...validated.data,
      phone: validated.data.phone,
      firebaseId: user.uid,
    },
  });
};
