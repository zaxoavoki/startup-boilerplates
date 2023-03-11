import casual from 'casual';

import { connectToDatabase, disconnectFromDatabase, prisma } from '.';
import { repeatSync } from '../lib/utils';
import { seedUser } from '../seeds/users';

async function main() {
  const users = repeatSync(casual.integer(100, 500), seedUser);

  await Promise.all(
    users.map(async data => {
      await prisma.user.create({
        data,
      });
    }),
  );
}

main()
  .then(connectToDatabase)
  .catch(async e => {
    console.error(e);
    await disconnectFromDatabase();
    process.exit(1);
  });
