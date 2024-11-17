# Application goals

We have application that allow clients checks up-time of their websites. 
We store health check result in database and show it to client in dashboard.

## Tasks 

- In module `auth` we have problem with hardcoded secret `jwtSecret` in `AuthGuard` and `AuthModule`. 
  We need to use configurable JWT secret. Use `.env` file.
- In module `auth` we have security issue with `password` in `AuthService`.
  - What is the problem?
  - How to fix it?
- Prepare controller CRUD in module `project`
  - Create project
  - Update project
  - Delete project
    - Do not delete project from database, just mark it as deleted
- Fix `ProjectController` GET /projects endpoint. 
  - We need to return only projects that are not deleted.
  - Add pagination to endpoint
    - Add query params `limit` and `offset`
    - Return only `limit` projects starting from `offset`
    - Add query param `search`. Return only projects that contains `search` in `name` or `url`
    - Example 
      `GET /projects?limit=10&offset=0&search=google`
      ```
      {
        "data": [
          {
            "id": 1,
            "name": "Google",
            "url": "https://google.com"
            ...
          },
          ...
        ],
        "total": 100,
        "size": 10,
        "offset": 0,
        "limit": 10
      }
      ```
- Prepare job that will run every 1 minutes and filters projects that has `expiredAt < NOW()`. 
  - Update status to `expired`

# Prepare

## What do you need

- IDE (Webstorm, Vscode)
- docker
- node
 
## Install

Copy `.env.tpl`
  
```bash
cp .env.tpl .env
```

Run `npm install`

## Run

Run docker containers 

```bash
docker compose up -d
```

Run backend 

```bash
npm run start:dev
```

Update database schema. Use this command when you change `schema.prisma` file.

```bash
npm run prisma:dev:update
```