# Suppli Frontend

React + TypeScript + Vite frontend for Suppli ordering system.

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

App will start on `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

## Project Structure

```
frontend/
  src/
    app/          # App bootstrap and routing
    components/   # Reusable UI components
    features/     # Feature-scoped logic and UI
    layouts/      # Layout components
    pages/        # Route-level components
    hooks/        # Shared React hooks
    lib/          # Utilities
    services/     # API clients
    styles/       # Global styles
    types/        # TypeScript types
```

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- React Hook Form + Zod
