# Ecommerce App

This document explains the project structure and the main npm scripts used to work with this Vite + React + TypeScript app.

## Project overview

This repository contains a Vite-powered React application written in TypeScript.

- `src/` - application source code
- `public/` - static files served by Vite
- `package.json` - npm project metadata and scripts
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` - TypeScript configuration files
- `vite.config.ts` - Vite configuration
- `README.md` - template documentation for the project

## Main npm scripts

The commands are defined in `package.json` under `scripts`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### `npm run dev`

- Starts the Vite development server.
- Runs the app in development mode.
- Provides fast refresh / hot module replacement.
- Use this when you are actively writing code and want to preview changes instantly.

Example:

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal.

### `npm run build`

- Builds the application for production.
- Runs TypeScript build with `tsc -b` first.
- Then generates optimized, bundled output using `vite build`.
- Output files are placed in the `dist/` directory.

Use this when you are preparing the app for deployment.

Example:

```bash
npm run build
```

### `npm run preview`

- Serves the production build locally.
- Uses the output created by `npm run build`.
- Lets you test the built app under the same environment as production.

Example:

```bash
npm run build
npm run preview
```

Then open the preview URL shown in the terminal.

## Why these commands are separate

Each script is designed for a different workflow:

- `dev` is for development and fast iteration.
- `build` is for compiling production-ready code.
- `preview` is for checking the production build before deployment.

This separation keeps the project easier to use and avoids mixing development behavior with production output.

## Additional useful commands

- `npm run lint` - checks code quality with ESLint.

## Notes

- Always run `npm install` once after cloning or pulling new dependencies.
- Use `npm run dev` while building features.
- Use `npm run build` and `npm run preview` when you want to verify the final production build.
