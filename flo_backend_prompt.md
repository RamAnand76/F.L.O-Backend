# F.L.O Backend — Fastify Project Prompt

> **Purpose**: Use this prompt in a separate window/agent to scaffold a production-ready Fastify backend for the F.L.O (Folio Intelligence) portfolio generator web app.

---

## 1. Project Overview

**F.L.O** is a portfolio generator that lets developers connect their GitHub account, select repositories and skills, choose a template, customize content, and publish a portfolio site to GitHub Pages.

**Frontend**: Next.js 15 (App Router) + TypeScript + Zustand + TailwindCSS v4  
**Backend to build**: Fastify + TypeScript (this prompt)  
**Database**: PostgreSQL (via Prisma ORM)  
**Auth**: JWT (access + refresh tokens)  
**Deployment target**: Docker-ready

---

## 2. Tech Stack (Mandatory)

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Fastify 5 |
| Language | TypeScript (strict mode) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (`@fastify/jwt`) with access + refresh token pattern |
| Validation | Fastify JSON Schema (built-in) |
| API Docs | `@fastify/swagger` + `@fastify/swagger-ui` |
| Security | `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit` |
| Env Config | `@fastify/env` with `.env` files |
| HTTP Client | `undici` (for GitHub API proxy calls) |
| AI | Google Gemini SDK (`@google/genai`) |
| Testing | Vitest + Supertest |
| Logging | Fastify's built-in Pino logger |

---

## 3. Project Structure (Mandatory)

```
flo-backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts                    # Fastify app factory
│   ├── server.ts                 # Entry point (starts server)
│   ├── config/
│   │   └── env.ts                # Environment variables schema
│   ├── plugins/
│   │   ├── auth.ts               # JWT auth plugin
│   │   ├── cors.ts               # CORS config
│   │   ├── swagger.ts            # Swagger/OpenAPI setup
│   │   ├── rate-limit.ts         # Rate limiting
│   │   └── prisma.ts             # Prisma client plugin
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   ├── github/
│   │   │   ├── github.routes.ts
│   │   │   ├── github.controller.ts
│   │   │   ├── github.service.ts
│   │   │   └── github.schema.ts
│   │   ├── portfolio/
│   │   │   ├── portfolio.routes.ts
│   │   │   ├── portfolio.controller.ts
│   │   │   ├── portfolio.service.ts
│   │   │   └── portfolio.schema.ts
│   │   ├── profile/
│   │   │   ├── profile.routes.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── profile.service.ts
│   │   │   └── profile.schema.ts
│   │   ├── deploy/
│   │   │   ├── deploy.routes.ts
│   │   │   ├── deploy.controller.ts
│   │   │   ├── deploy.service.ts
│   │   │   └── deploy.schema.ts
│   │   └── ai/
│   │       ├── ai.routes.ts
│   │       ├── ai.controller.ts
│   │       ├── ai.service.ts
│   │       └── ai.schema.ts
│   ├── middleware/
│   │   └── authenticate.ts       # JWT verification preHandler
│   ├── utils/
│   │   ├── errors.ts             # Custom error classes
│   │   └── helpers.ts            # Shared utilities
│   └── types/
│       └── index.d.ts            # Global type declarations
├── tests/
│   ├── auth.test.ts
│   ├── github.test.ts
│   ├── portfolio.test.ts
│   └── helpers/
│       └── setup.ts
├── .env.example
├── .env
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── package.json
└── README.md
```

**Architecture pattern**: Each module follows `routes → controller → service` separation:
- **Routes**: Define endpoints, attach JSON schemas, wire preHandlers
- **Controller**: Parse request, call service, format response
- **Service**: Business logic, database queries, external API calls

---

## 4. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  githubProfile GithubProfile?
  portfolio     Portfolio?

  @@map("users")
}

model GithubProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  githubLogin   String
  githubId      Int
  avatarUrl     String
  htmlUrl       String
  name          String?
  company       String?
  blog          String?
  location      String?
  email         String?
  bio           String?
  publicRepos   Int      @default(0)
  followers     Int      @default(0)
  following     Int      @default(0)

  repositories  Repository[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("github_profiles")
}

model Repository {
  id              String   @id @default(cuid())
  githubProfileId String
  githubProfile   GithubProfile @relation(fields: [githubProfileId], references: [id], onDelete: Cascade)

  githubRepoId    Int
  name            String
  fullName        String
  htmlUrl         String
  description     String?
  stargazersCount Int      @default(0)
  language        String?
  homepage        String?
  updatedAt       String   // ISO date string from GitHub

  @@map("repositories")
}

model Portfolio {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  selectedRepoIds Int[]    // Array of GitHub repo IDs
  skills          String[] // Array of skill strings
  selectedTemplate String  @default("minimal") // 'minimal' | 'developer' | 'creative'

  customName      String   @default("")
  customBio       String   @default("")
  customEmail     String   @default("")
  customLocation  String   @default("")
  customWebsite   String   @default("")
  customGithub    String   @default("")
  customTwitter   String   @default("")
  customLinkedin  String   @default("")

  deployedUrl     String?
  repoName        String?
  customDomain    String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("portfolios")
}
```

---

## 5. API Endpoints Specification

### 5.1 Auth Module — `POST /api/auth/*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login with email + password |
| `POST` | `/api/auth/refresh` | ❌ | Refresh expired access token |
| `POST` | `/api/auth/logout` | ✅ | Invalidate refresh token |
| `GET`  | `/api/auth/me` | ✅ | Get current authenticated user |

**Register Request Body:**
```json
{
  "name": "string (required, min 2 chars)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 chars)"
}
```

**Register Response (201):**
```json
{
  "accessToken": "string (JWT, 15min expiry)",
  "refreshToken": "string (JWT, 7d expiry)",
  "user": {
    "id": "cuid",
    "name": "string",
    "email": "string"
  }
}
```

**Login Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Login Response (200):** Same shape as Register Response.

**Refresh Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Refresh Response (200):**
```json
{
  "accessToken": "string (new JWT)"
}
```

---

### 5.2 GitHub Proxy Module — `GET/POST /api/github/*`

> **IMPORTANT**: The frontend currently calls `https://api.github.com` directly from the browser (in [connect/page.tsx](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/app/connect/page.tsx)). The backend must proxy these calls to avoid GitHub API rate limits (60/hr unauthenticated) and to cache data in the database.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/github/connect` | ✅ | Fetch GitHub user + repos by username, store in DB |
| `GET`  | `/api/github/profile` | ✅ | Get stored GitHub profile for current user |
| `GET`  | `/api/github/repos` | ✅ | Get stored repositories for current user |
| `POST` | `/api/github/refresh` | ✅ | Re-fetch latest data from GitHub API & update DB |
| `DELETE` | `/api/github/disconnect` | ✅ | Remove GitHub connection (clear GitHub data) |

**Connect Request Body:**
```json
{
  "username": "string (required, GitHub username)"
}
```

**Connect Response (200):**
```json
{
  "user": {
    "login": "string",
    "id": 12345,
    "avatar_url": "string (URL)",
    "html_url": "string (URL)",
    "name": "string | null",
    "company": "string | null",
    "blog": "string",
    "location": "string | null",
    "email": "string | null",
    "bio": "string | null",
    "public_repos": 42,
    "followers": 100,
    "following": 50
  },
  "repos": [
    {
      "id": 123456,
      "name": "string",
      "full_name": "string",
      "html_url": "string (URL)",
      "description": "string | null",
      "stargazers_count": 10,
      "language": "string | null",
      "homepage": "string | null",
      "updated_at": "string (ISO 8601)"
    }
  ]
}
```

**GitHub REST API calls the backend must make (using `undici`):**
1. `GET https://api.github.com/users/{username}` → Fetch user profile
2. `GET https://api.github.com/users/{username}/repos?sort=updated&per_page=100` → Fetch repos
3. Filter repos: Exclude forks (`fork === false`), require description (`description !== null`), limit to 20

---

### 5.3 Portfolio Module — `GET/PUT /api/portfolio/*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/portfolio` | ✅ | Get current user's full portfolio state |
| `PUT`  | `/api/portfolio/repos` | ✅ | Update selected repository IDs |
| `PUT`  | `/api/portfolio/skills` | ✅ | Update skills list |
| `PUT`  | `/api/portfolio/template` | ✅ | Update selected template |
| `GET`  | `/api/portfolio/export` | ✅ | Get full portfolio data for rendering |

**Get Portfolio Response (200):**
```json
{
  "selectedRepoIds": [123, 456, 789],
  "skills": ["React", "TypeScript", "Node.js"],
  "selectedTemplate": "minimal",
  "customData": {
    "name": "string",
    "bio": "string",
    "email": "string",
    "location": "string",
    "website": "string",
    "github": "string",
    "twitter": "string",
    "linkedin": "string"
  },
  "deployment": {
    "deployedUrl": "string | null",
    "repoName": "string | null",
    "customDomain": "string | null"
  }
}
```

**Update Selected Repos Request Body:**
```json
{
  "selectedRepoIds": [123, 456, 789]
}
```

**Update Skills Request Body:**
```json
{
  "skills": ["React", "TypeScript", "Fastify"]
}
```

**Update Template Request Body:**
```json
{
  "selectedTemplate": "minimal | developer | creative"
}
```

---

### 5.4 Profile Module — `GET/PUT /api/profile`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/profile` | ✅ | Get custom profile data |
| `PUT`  | `/api/profile` | ✅ | Update custom profile data |

**Update Profile Request Body (all fields optional):**
```json
{
  "name": "string",
  "bio": "string",
  "email": "string",
  "location": "string",
  "website": "string",
  "github": "string",
  "twitter": "string",
  "linkedin": "string"
}
```

---

### 5.5 Deploy Module — `POST /api/deploy/*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/deploy/github-pages` | ✅ | Generate portfolio HTML & deploy to GitHub Pages |
| `GET`  | `/api/deploy/status` | ✅ | Check deployment status |

**Deploy Request Body:**
```json
{
  "repoName": "string (required, e.g. 'my-portfolio-2024')",
  "customDomain": "string (optional, e.g. 'portfolio.yourname.com')"
}
```

**Deploy Response (202):**
```json
{
  "message": "Deployment started",
  "deployedUrl": "https://username.github.io/my-portfolio-2024",
  "repoUrl": "https://github.com/username/my-portfolio-2024"
}
```

> **Note**: This endpoint requires a **GitHub Personal Access Token** (stored per user or as an app-level token). The deploy flow should:
> 1. Generate static HTML from the selected template + user data
> 2. Create a new GitHub repository via `POST https://api.github.com/user/repos`
> 3. Push the generated HTML to the repo
> 4. Enable GitHub Pages via `PUT https://api.github.com/repos/{owner}/{repo}/pages`

---

### 5.6 AI Assistant Module — `POST /api/ai/*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/enhance` | ✅ | AI-powered content enhancement |

**Enhance Request Body:**
```json
{
  "prompt": "string (required, e.g. 'Make my bio sound more professional')",
  "context": {
    "field": "bio | name | skills",
    "currentValue": "string"
  }
}
```

**Enhance Response (200):**
```json
{
  "enhanced": "string (AI-generated improved content)",
  "original": "string (original value for undo)"
}
```

> Use the `@google/genai` SDK (Google Gemini). API key stored in `GEMINI_API_KEY` env var.

---

## 6. GitHub REST API Dependencies (Complete List)

| # | GitHub API Endpoint | HTTP Method | Used In | Purpose |
|---|---|---|---|---|
| 1 | `https://api.github.com/users/{username}` | `GET` | GitHub Module | Fetch public profile |
| 2 | `https://api.github.com/users/{username}/repos?sort=updated&per_page=100` | `GET` | GitHub Module | Fetch public repos |
| 3 | `https://api.github.com/user/repos` | `POST` | Deploy Module | Create new repo for portfolio |
| 4 | `https://api.github.com/repos/{owner}/{repo}/contents/{path}` | `PUT` | Deploy Module | Push generated HTML files |
| 5 | `https://api.github.com/repos/{owner}/{repo}/pages` | `POST` | Deploy Module | Enable GitHub Pages |
| 6 | `https://api.github.com/repos/{owner}/{repo}/pages` | `GET` | Deploy Module | Check Pages deployment status |

**Rate Limit Handling**: Cache GitHub API responses in the database. Re-fetch only on explicit user action (`/api/github/refresh`). Use GitHub API token in server-side requests to get 5000 req/hr instead of 60/hr.

---

## 7. Environment Variables

```env
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flo_db

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# GitHub
GITHUB_API_TOKEN=ghp_your_github_personal_access_token

# AI
GEMINI_API_KEY=your-gemini-api-key

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 8. Non-Functional Requirements

### Security
- Hash passwords with `bcrypt` (12 salt rounds)
- JWT access tokens expire in 15 minutes; refresh tokens in 7 days
- Rate limit: 100 requests/minute per IP (auth endpoints: 10/minute)
- Input validation on every endpoint via JSON Schema
- CORS: Allow only `FRONTEND_URL` origin
- Helmet headers enabled

### Error Handling
- Consistent error response format across all endpoints:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Human-readable error description"
}
```
- Use Fastify's `setErrorHandler` for global error handling
- Log all errors with Pino structured logging

### Performance
- Enable response compression (`@fastify/compress`)
- Use Prisma connection pooling  
- Cache GitHub API responses in DB (avoid redundant calls)

### Docker
- Multi-stage `Dockerfile` (build + runtime)
- `docker-compose.yml` with PostgreSQL + backend services
- Health check endpoint: `GET /api/health` → `{ status: "ok", uptime: number }`

---

## 9. Startup Checklist

When scaffolding this project, follow this exact order:

1. `mkdir flo-backend && cd flo-backend`
2. `npm init -y && npm i typescript tsx @types/node -D`
3. Create [tsconfig.json](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/tsconfig.json) with `strict: true`, `module: "ESNext"`, `target: "ES2022"`
4. Install Fastify core: `npm i fastify @fastify/jwt @fastify/cors @fastify/helmet @fastify/rate-limit @fastify/swagger @fastify/swagger-ui @fastify/env @fastify/compress`
5. Install dependencies: `npm i prisma @prisma/client bcrypt undici @google/genai`
6. Install dev deps: `npm i -D @types/bcrypt vitest supertest @types/supertest`
7. `npx prisma init` → Configure the schema as specified in Section 4
8. Build the project structure as specified in Section 3
9. Implement modules in this order: `auth → github → profile → portfolio → deploy → ai`
10. Add `Dockerfile` + `docker-compose.yml`

---

## 10. Summary of Frontend–Backend Data Contracts

The frontend currently uses Zustand with these state shapes. The backend API responses MUST match these exactly:

### [GithubUser](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/store/useStore.ts#3-18) (from [useStore.ts](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/store/useStore.ts))
```typescript
interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}
```

### [Repository](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/store/useStore.ts#19-30) (from [useStore.ts](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/store/useStore.ts))
```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  homepage: string | null;
  updated_at: string;
}
```

### `customData` (from [useStore.ts](file:///c:/Users/LENOVO/Desktop/Sup/FLO-io/FLO-neo/F.L.O/src/store/useStore.ts))
```typescript
interface CustomData {
  name: string;
  bio: string;
  email: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
}
```

### Available Templates
```typescript
type Template = 'minimal' | 'developer' | 'creative';
```

---

> **CRITICAL**: All API responses for GitHub user and repository data MUST use the exact field names shown above (e.g. `avatar_url`, `stargazers_count`, `full_name`) — these are the exact keys the frontend Zustand store expects. Do NOT rename them to camelCase.
