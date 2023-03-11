import { QueryResolvers } from '../../../generated/graphql';
import { getUser as getUserService } from '../../services/users';

export const getUser: QueryResolvers['getUser'] = (_parent, { input }) => {
  return getUserService(input.id);
};
