# Suppli Backend API

Express + TypeScript backend for Suppli ordering system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in `.env.local` with your credentials (see `docs/ENVIRONMENT_VARIABLES.md`)

## Development

```bash
npm run dev
```

Server will start on `http://localhost:3001`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

## Project Structure

```
server/
  src/
    app.ts           # Express app configuration
    server.ts        # Server entry point
    config/          # Configuration management
    routes/          # API route definitions
    controllers/     # Request handlers
    services/        # Business logic services
    domain/          # Domain logic (order generation, etc.)
    validators/      # Zod validation schemas
    middleware/      # Custom middleware
    errors/          # Error classes
    lib/             # Utilities
```

## Health Check

```bash
curl http://localhost:3001/health
```

## API Versioning

All API endpoints are prefixed with `/api/v1`
