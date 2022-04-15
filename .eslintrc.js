/* eslint-disable semi */
/* eslint-disable comma-dangle */
module.exports = {
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        semi: [2, 'always'],
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
};
