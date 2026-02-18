import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nextConfig from 'eslint-config-next';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  ...nextConfig,
  ...compat.config({
    plugins: ['prettier', 'unicorn'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          bracketSpacing: true,
          tabWidth: 2,
          printWidth: 80,
          useTabs: false,
          trailingComma: 'es5',
          endOfLine: 'auto',
          semi: true,
          singleQuote: true,
        },
      ],
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'max-lines-per-function': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 2,
      'jest/no-deprecated-functions': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/require-default-props': 'off',
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'block-spacing': 1,
      'react-hooks/set-state-in-effect': 'off',
    },
  }),
];

export default eslintConfig;
