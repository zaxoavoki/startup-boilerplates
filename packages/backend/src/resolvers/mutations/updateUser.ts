import { MutationResolvers } from '../../../generated/graphql';
import { updateUserService } from '../../services/users/update';

export const updateUser: MutationResolvers['updateUser'] = (
  _parent,
  { input },
  { userProfile },
) => {
  if (!userProfile) {
    throw new Error('Not authenticated');
  }

  return updateUserService(userProfile.id, input);
};
