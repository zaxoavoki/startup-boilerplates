import { prisma } from '../../prisma';

export const deleteUser = async (id: string) => {
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  return !!deletedUser.id;
};
