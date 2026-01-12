# Suppli — Development Workflow

## Overview
This document describes the development workflow, tooling, and best practices for working on Suppli.

## Prerequisites
- Node.js 20+
- npm or yarn
- Git

## Getting Started

### Initial Setup
1. Clone the repository
2. Install dependencies for both projects:
   ```bash
   cd server && npm install
   cd ../frontend && npm install
   ```

### Environment Variables
See `docs/ENVIRONMENT_VARIABLES.md` for required environment variables.

## Development Workflow

### Branch Strategy
- **Main branch**: Production-ready code only
- **Feature branches**: `feature/<name>` for new features
- **Never commit directly to main**

### Workflow Steps
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Run linting and formatting
4. Commit with descriptive messages
5. Push branch
6. Create pull request (or merge after testing)

## Available Scripts

### Backend (server/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check without building

### Frontend (frontend/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check without building

## Code Quality

### Linting
Both projects use ESLint with TypeScript support. Run before committing:
```bash
# Backend
cd server && npm run lint

# Frontend
cd frontend && npm run lint
```

### Formatting
Both projects use Prettier. Format code before committing:
```bash
# Backend
cd server && npm run format

# Frontend
cd frontend && npm run format
```

### Type Checking
Ensure TypeScript compiles without errors:
```bash
# Backend
cd server && npm run type-check

# Frontend
cd frontend && npm run type-check
```

## Pre-Commit Checklist
Before committing, ensure:
- [ ] Code is formatted (`npm run format`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Tests pass (when available)
- [ ] No console errors in browser/terminal

## Commit Messages
Follow conventional commit format:
```
<type>(<scope>): <subject>

<body (optional)>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(orders): add order generation endpoint
fix(auth): resolve business context resolution bug
refactor(domain): extract quantity calculation logic
docs(api): document orders endpoints
```

## CI/CD
GitHub Actions runs on every push:
- Linting for both projects
- Type checking for both projects
- Tests (when available)

See `.github/workflows/ci.yml` for details.

## Code Style

### TypeScript
- Use strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Use enums for constants

### Naming Conventions
- Files: `kebab-case` for files, `PascalCase` for components
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Code Organization
- Keep functions small and focused
- Extract reusable logic
- Document complex logic
- Follow project folder structure

## Troubleshooting

### Linting Errors
- Run `npm run format` to auto-fix formatting issues
- Fix remaining linting errors manually
- Check ESLint config if rules seem incorrect

### Type Errors
- Ensure all types are properly defined
- Check `tsconfig.json` settings
- Use type assertions sparingly

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (20+)
- Verify all dependencies are installed

## Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [React Best Practices](https://react.dev/learn)
