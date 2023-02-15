import { QueryResolvers } from '../../../generated/graphql';

export const example: QueryResolvers['example'] = () => {
  return {
    id: 'example',
    a: 1,
    b: 2,
  };
};
