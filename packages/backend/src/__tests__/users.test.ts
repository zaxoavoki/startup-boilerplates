import type { User } from '@prisma/client';
import assert from 'assert';
import gql from 'graphql-tag';

import type { ApolloContext } from '../lib/context';
import { prisma } from '../prisma';
import { createUser } from '../seeds/users';
import { createServer } from '../server';

const { apolloServer, startServer, stopServer } = createServer();

beforeAll(() => startServer(0));
afterEach(() => prisma.user.deleteMany());
afterAll(() => stopServer());

const UpdateUserDocument = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
    }
  }
`;

describe('Manage users', () => {
  it('should be able to update user with basic fields', async () => {
    const user = await createUser();

    const { body } = await apolloServer.executeOperation<{
      updateUser: User;
    }>(
      {
        query: UpdateUserDocument,
        variables: {
          input: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
      { contextValue: { userProfile: user } as ApolloContext },
    );

    assert(body.kind === 'single');
    const { data, errors } = body.singleResult;

    expect(errors).toBeUndefined();
    expect(data).toMatchObject({
      updateUser: {
        id: user.id,
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser).toMatchObject({
      id: user.id,
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should throw an error on too long firstName', async () => {
    const user = await createUser();

    const { body } = await apolloServer.executeOperation(
      {
        query: UpdateUserDocument,
        variables: {
          input: {
            firstName: 'John'.repeat(100),
            lastName: 'Doe',
          },
        },
      },
      { contextValue: { userProfile: user } as ApolloContext },
    );

    assert(body.kind === 'single');
    const { data, errors } = body.singleResult;

    expect(errors).toBeDefined();
    expect(JSON.stringify(errors)).toContain(
      'String must contain at most 32 character(s)',
    );
    expect(data?.updateUser).toBeNull();

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(updatedUser).toMatchObject({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  });

  it('should be able to create a user', async () => {
    const { body } = await apolloServer.executeOperation(
      {
        query: gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              firstName
              phone
            }
          }
        `,
        variables: {
          input: {
            phone: '+1234567890',
            firstName: 'John',
          },
        },
      },
      { contextValue: { user: { uid: '123' } } as ApolloContext },
    );

    assert(body.kind === 'single');
    const { data, errors } = body.singleResult;

    expect(errors).toBeUndefined();
    expect(data).toMatchObject({
      createUser: {
        firstName: 'John',
        phone: '+1234567890',
      },
    });
  });

  it('should get an error when creating a user with an existing phone', async () => {
    await createUser({ phone: '+1234567890', firebaseId: '123' });

    const { body } = await apolloServer.executeOperation(
      {
        query: gql`
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              firstName
              phone
            }
          }
        `,
        variables: {
          input: {
            phone: '+1234567890',
            firstName: 'John',
          },
        },
      },
      { contextValue: { user: { uid: '456' } } as ApolloContext },
    );

    assert(body.kind === 'single');
    const { data, errors } = body.singleResult;

    expect(errors).toBeDefined();
    expect(errors?.[0].message).toContain('User already exists');
    expect(data?.createUser).toBeNull();
  });
});
