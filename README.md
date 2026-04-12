# Spekta

> ⚠️ **Warning**
> Spekta is currently under active development. Features may be incomplete, changed, or missing.

Expo Router + React Native + Supabase starter structured around feature-local code.

## Stack

- Expo + React Native
- Expo Router for navigation
- TypeScript
- Supabase for backend services

## Project structure

```text
app/                    # Routes and screens only
src/
  features/             # Feature-local UI, hooks, services, types, utils
  components/           # Shared UI and shared layout components
  hooks/                # Shared reusable React hooks
  lib/                  # Infrastructure setup such as Supabase client
  config/               # App config and environment access
  constants/            # Shared constants
  themes/               # Theme tokens and styling primitives
  providers/            # App-wide providers
  types/                # Shared TypeScript types
  utils/                # Shared non-React helpers
  tests/                # Test files and test helpers
supabase/               # Supabase functions, migrations, and seed data
assets/                 # Static assets
scripts/                # Repo scripts and automation helpers
```

## Folder rules

- Route or screen -> `app/`
- UI used by one feature -> `src/features/<feature>/components`
- UI shared across unrelated features -> `src/components/`
- Reusable React logic -> `src/hooks/` or `src/features/<feature>/hooks`
- Supabase or API calls -> `src/lib/` for setup, `services/` for queries/actions
- Plain helper functions -> `src/utils/` or feature-local `utils.ts`
- Shared types -> `src/types/` or feature-local `types.ts`
- App-wide setup -> `src/providers/`, `src/config/`, `src/themes/`, `src/constants/`

Default rule: keep code local to the feature first. Only move it global when it is reused across unrelated areas or is true app infrastructure.

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the Expo dev server

   ```bash
   npm start
   ```

3. Open the app on your target platform

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Useful commands

- `npm start` - start Expo
- `npm run android` - open Android flow
- `npm run ios` - open iOS flow
- `npm run web` - open web flow
- `npm run lint` - run ESLint across `app`, `src`, and `scripts`
- `npm exec tsc -- --noEmit` - run a TypeScript check

## Notes

- `app/` should stay route-focused; avoid putting reusable feature logic there.
- Shared imports use the `@/` alias, which maps to `src/`.
- Top-of-file purpose comments are used in source files to make responsibilities easier to scan.
