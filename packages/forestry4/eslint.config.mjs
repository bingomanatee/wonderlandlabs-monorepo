// @ts-check
import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// ESLint configuration
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['**/build/**', '**/tmp/**', '**/coverage/**'],
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json', // Ensure this path is correct
        tsconfigRootDir: './', // Make sure this is correct as well
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      indent: ['error', 2],
      curly: 1,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-unused-vars': 'off', // Avoid setting both rules for the same lint issue
      semi: ['error', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['off'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['__tests__/**/*.ts'],
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
      parserOptions: {
        project: '../tsconfig.json', // Ensure this path is correct
        tsconfigRootDir: '__tests__', // Make sure this is correct as well
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'no-sparse-arrays': 'off',
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
      parserOptions: {
        project: null, // Disable project-based linting for test files
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'no-sparse-arrays': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
