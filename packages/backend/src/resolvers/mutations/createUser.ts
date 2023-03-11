import { MutationResolvers } from '../../../generated/graphql';
import { createUser as createUserService } from '../../services/users';

export const createUser: MutationResolvers['createUser'] = (
  _parent,
  { input },
  { user },
) => {
  if (!user) {
    throw new Error('Not authenticated');
  }

  return createUserService(input, user);
};
