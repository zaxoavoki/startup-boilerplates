# Startup boilerplates

I'm tired of doing the same thing over and over again. That's why I decided to archieve here all
project templates I'm actively using.

## Backend

  This project is built with `nx` package. It contains `backend` package, which is literally the whole backend
  which uses the most popular tools nowadays, such as:
  
  - Apollo server (with few plugins)
  - GraphQL tools (code generator)
  - Linting
  - Prisma with MongoDB provider
  - Sentry reporting
  - Firebase admin
  
  But if you don't really need `nx` or don't like it, there is no problem separating the `backend` package.

  ### Structure

  - `lib` folder contains all the code which is used by the `backend` package. It's a good practice to separate
    the code which is used by the package and the code which is used by the whole project.
  - `middlewares` folder contains all the Express middlewares.
  - `resolvers` folder contains all the GraphQL resolvers.
  - `prisma` folder contains all the Prisma related files, such as `schema.prisma`, seeders and migrations.
  - `services` folder contains all the services which are used by the resolvers.

## Frontend

  Project contains `web` package, which is literally the whole frontend
  which uses the most popular tools nowadays, such as:
  
  - React
  - Next.js
  - Mantine
  - Apollo Client
  - Linting
  - Sentry reporting
  - Firebase
  
  You can separate the `web` package if you don't like `nx` or don't need it as well.

  ### Structure

  `web` package has the default Next.js structure of version 13.


In the future, I'm also planning to add more templates connected to frontend and mobile apps.

P.S. There is a popular framework called `redwoodjs` which is also a great tool for building fullstack apps. I don't use it because I don't like the way it's built. It also does not support SSR yet. But if you like it, you can use it instead of this boilerplate. It's also has a great cli tool for generating new pages, components, etc.
