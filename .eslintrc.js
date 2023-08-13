module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: true,
        },
      },
    ], // This rule requires interface name to be prefixed with I
    '@typescript-eslint/explicit-function-return-type': 'error', // This rule requires that functions should explicitly specify their return type.
    '@typescript-eslint/explicit-module-boundary-types': 'error', // This rule enforces that exported function and class method definitions should have explicit return and argument types
    '@typescript-eslint/no-explicit-any': 'error', // This rule disallows usage of the any type
    '@typescript-eslint/no-unused-vars': 'error', // This rule will flag any variables that are declared but never used.
    '@typescript-eslint/no-var-requires': 'error', // This rule disallows the use of require statements except in import statements.
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
    ], // This rule enforces camelcase naming conventions for properties, variables, etc.
    '@typescript-eslint/no-empty-function': 'error', // This rule disallows empty function declarations
    '@typescript-eslint/no-floating-promises': 'error', // This rule disallows floating promises, which are promises without a catch block.
    '@typescript-eslint/no-use-before-define': 'error', // This rule disallows the use of a variable before it was defined.
    '@typescript-eslint/prefer-nullish-coalescing': 'error', // This rule recommends using nullish coalescing instead of logical OR. Nullish coalescing provides a stricter check as it only checks for null or undefined and not other falsy values.
    '@typescript-eslint/prefer-optional-chain': 'error', // This rule recommends using optional chaining instead of complex nested conditionals.
    '@typescript-eslint/no-parameter-properties': 'error', // This rule disallows the use of parameter properties in class constructors.
    '@typescript-eslint/no-non-null-assertion': 'error', //  This rule disallows non-null assertions using the ! postfix operator.
    '@typescript-eslint/no-namespace': 'error', //This rule disallows the use of custom TypeScript modules and namespaces.
    '@typescript-eslint/no-misused-promises': 'error', // This rule warns when a Promise is incorrectly handled. It has two areas it checks - when an async function is given where a synchronous function is expected, and when a Promise is not awaited in a conditional.
    '@typescript-eslint/prefer-readonly': 'warn',
  },
};
