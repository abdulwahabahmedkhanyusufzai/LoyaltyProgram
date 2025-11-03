module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",        // Next.js recommended rules
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended" // TypeScript-specific rules
  ],
  rules: {
    "no-console": "warn",          // Example: warn on console
    "@typescript-eslint/no-unused-vars": ["warn"]
  },
};
