import { User } from '@prisma/client';
import { isNil, mapValues, omitBy } from 'lodash';

import { UpdateUserInput } from '../../../generated/graphql';
import { validateUser } from '../../lib/validators';
import { prisma } from '../../prisma';

export const updateUserService = (id: User['id'], input: UpdateUserInput) => {
  const validation = validateUser(
    omitBy(input, isNil),
    mapValues(omitBy(input, isNil), Boolean),
  );

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  return prisma.user.update({
    where: { id },
    data: validation.data,
  });
};
