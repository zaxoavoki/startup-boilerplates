import { MutationResolvers } from '../../../generated/graphql';
import { deleteUser as deleteUserService } from '../../services/users';

export const deleteUser: MutationResolvers['deleteUser'] = (
  _parent,
  _args,
  { userProfile },
) => {
  if (!userProfile) {
    throw new Error('Not authenticated');
  }

  return deleteUserService(userProfile.id);
};
