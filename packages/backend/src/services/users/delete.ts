import { prisma } from '../../prisma';

export const deleteUser = async (id: string) => {
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  const users = await prisma.user.findMany({
    where: {
      OR: [{ likeUserIDs: { has: id } }, { likedByIDs: { has: id } }],
    },
  });

  // https://github.com/prisma/prisma/issues/7401
  await Promise.all(
    users.map(async user => {
      const likeUserIDs = user.likeUserIDs.filter(uid => uid !== id);
      const likedByIDs = user.likedByIDs.filter(uid => uid !== id);

      await prisma.user.update({
        where: { id: user.id },
        data: { likeUserIDs, likedByIDs },
      });
    }),
  );

  return !!deletedUser.id;
};
