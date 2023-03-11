import { gql } from 'apollo-server';
import type { UserRecord } from 'firebase-admin/lib/auth/user-record';

import { prisma } from '../prisma';
import { createUser } from '../seeds/users';
import { createServer } from '../server';

const { server, startServer, stopServer } = createServer();

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

    const { data, errors } = await server.executeOperation(
      {
        query: UpdateUserDocument,
        variables: {
          input: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
      {
        userProfile: user,
      },
    );

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

    const { data, errors } = await server.executeOperation(
      {
        query: UpdateUserDocument,
        variables: {
          input: {
            firstName: 'John'.repeat(100),
            lastName: 'Doe',
          },
        },
      },
      {
        userProfile: user,
      },
    );

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
    const { data, errors } = await server.executeOperation(
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
      { user: { uid: '123' } as UserRecord },
    );

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

    const { data, errors } = await server.executeOperation(
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
      { user: { uid: '456' } as UserRecord },
    );

    expect(errors).toBeDefined();
    expect(errors?.[0].message).toContain('User already exists');
    expect(data?.createUser).toBeNull();
  });
});
