
# Hipaa Backend

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Overview
Modularity: Each feature area—authentication, users, files, folders, permissions, shared links, and activity logs—has its own dedicated module. This separation allows you to work on or modify one part without affecting the others.

**Clear Separation of Concerns:**

1. *Auth Module:* Handles everything related to authentication and user entities.
2. *Users Module:* Manages user-specific operations (CRUD, updates, etc.).
3. *Files and Folders Modules:* Organize file storage, file uploads/downloads, and folder hierarchy management.
4. *Permissions Module:* Manages access controls, ensuring fine-grained permission settings across files and folders.
5. *Shared Links Module:* Deals with generating secure links, sharing functionality, and expiration logic.
6. *Activity Logs Module:* Tracks user activity for auditing and compliance.
7. *Common Module:* Contains utilities like constants, decorators, filters, interceptors, and pipes, which are reusable across the project.
8. *Config Module:* Centralizes configuration settings (database, AWS, JWT, etc.) to keep your application settings organized and easily manageable.


**Scalability & Maintainability:** With this structure, as the application grows or changes, you can easily add new features or adjust existing ones without causing confusion.

