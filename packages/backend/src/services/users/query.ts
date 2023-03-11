import { prisma } from '../../prisma';

export const getUser = (id: string) => {
  return prisma.user.findFirstOrThrow({
    where: { id },
  });
};
