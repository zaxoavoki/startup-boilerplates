import { MutationResolvers } from '../../../generated/graphql';

export const addExample: MutationResolvers['addExample'] = () => {
  return {
    id: 'example',
    a: 1,
    b: 2,
  };
};
