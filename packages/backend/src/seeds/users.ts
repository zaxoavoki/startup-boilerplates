import { User } from '@prisma/client';
import { ObjectId } from 'bson';
import casual from 'casual';

import { prisma } from '../prisma';

casual.define('user', () => {
  const randomUsername = casual.username;
  const [firstName, lastName] = randomUsername.replace('_', '.').split('.');
  const username = randomUsername
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLocaleLowerCase();

  return {
    id: new ObjectId().toString(),
    firstName,
    lastName,
    sex: casual.random_element(['Male', 'Female', 'Other']) as string,
    dateOfBirth: new Date(),
    phone: casual.phone,
    country: casual.country,
    city: casual.city,
    avatarUrl: casual.url,
    firebaseId: casual.uuid,
    onboarded: true,
    inactive: false,
    instagram: username,
    twitter: username,
    website: casual.url,
    bio: casual.text,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

export const seedUser = () => {
  return (casual as unknown as { user: User }).user;
};

export const createUser = (attributes: Partial<User> = {}) => {
  return prisma.user.create({
    data: {
      ...seedUser(),
      ...attributes,
    },
  });
};
