# FA Project: Coding Standards

## Backend (Node.js/TypeScript)
- Use **Strict TypeScript** configuration.
- Follow **ESLint** and **Prettier** conventions.
- Use **JSDoc** for all service functions.
- All financial calculations must use a decimal library if high precision is required, otherwise use native `number` for standard PMT.

## Git Standards
- Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`.

## Agent Communication
- Agents should hand off data via `production_artifacts/`.
- Updated state should be reflected in the `task.md` or equivalent.
