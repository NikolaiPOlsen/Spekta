# Docstring templates for the Expo + Supabase app.

Use these templates for source files only.
Add a short top-of-file purpose comment to every route, component, hook, constant, service, utility, provider, and type file.

## File header

```ts
/**
 * <What this file provides and where it fits in the app>.
 */
```

## Route or screen

```tsx
/**
 * Renders the <screen name> route for <feature or navigation group>.
 */
```

## Component

```tsx
/**
 * Renders <UI purpose> for <feature, screen, or shared app usage>.
 */
```

## Hook

```ts
/**
 * Manages <state, derived values, or side effects> for <feature or shared use case>.
 * Returns <key values or behavior>.
 */
```

## Service

```ts
/**
 * Handles <Supabase, API, storage, or external integration responsibility> for <feature>.
 */
```

## Utility

```ts
/**
 * Formats, validates, or transforms <input> for <use case>.
 */
```

## Types

```ts
/**
 * Defines shared types for <feature or app domain>.
 */
```

## Provider or config

```ts
/**
 * Configures <app-wide concern> for the application.
 */
```

## Inline comments

Only add inline comments for logic that is not obvious from the code itself.
Prefer concise comments that explain why the code exists instead of narrating what each line does.
