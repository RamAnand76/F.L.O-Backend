# F.L.O Backend

Backend for the **F.L.O** portfolio generator. Built with Fastify 5, Prisma, and PostgreSQL.

## Features

- **Auth**: JWT-based authentication (access + refresh tokens).
- **GitHub Proxy**: Fetch and cache GitHub user/repo data.
- **Portfolio Management**: Customize skills, templates, and repo selection.
- **Deployment**: Generate static HTML and deploy to GitHub Pages.
- **AI Enhancement**: AI-powered content improvement via Google Gemini.
- **Security**: CORS, Helmet, Rate Limiting, and Input Validation.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Fastify 5
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **AI**: Google Gemini SDK
- **Security**: @fastify/jwt, @fastify/helmet, @fastify/rate-limit

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- GitHub Personal Access Token (for deployment)
- Google Gemini API Key (for AI enhancement)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Docker

To run the entire stack (backend + database) using Docker:

```bash
docker-compose up --build
```

## API Documentation

Once the server is running, access the Swagger UI at:
`http://localhost:3001/documentation`

## Project Structure

- `src/app.ts`: App factory and plugin registration.
- `src/modules/`: Business logic divided by features.
- `src/plugins/`: Fastify custom plugins.
- `src/middleware/`: Global and route-specific middleware.
- `prisma/`: Database schema and migrations.
