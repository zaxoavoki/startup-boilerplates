# Simple backend built on top of Node.js

#### Used packages:

- Apollo server
- Graphql
- Prisma

#### Available features:

- linting (eslint)
- testing (jest)
- generating GraphQL types (graphql-codegen)

I have bad experience with ORMs like typeorm or sequelize, I think they are overcomplicated and 
hard to maintain. They have bad typing as well.

That's why I decided to try `Prisma` ORM package.


Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Define models in the schema.prisma file.
3. Run prisma generate to generate the Prisma Client. You can then start querying your database.
