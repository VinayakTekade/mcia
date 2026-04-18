# Auth Service

Manages user authentication and authorization.

## Features
* **Register**: Create new users with roles.
* **Login**: Authenticate users and receive a JWT.
* **Profile**: Fetch the currently logged in user profile.
* **Verify**: Validates token format (internal endpoint proxy target).

## Database
Uses PostgreSQL via Prisma.
Commands:
* `npm run db:generate`: Generates the Prisma client.
* `npm run db:push`: Pushes schema to the DB.
* `npm run db:seed`: Seeds initial users.

## Endpoints
* `POST /register`
* `POST /login`
* `GET /profile`
* `GET /verify`
