module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: [ 'dist', '.eslintrc.js' ],
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    "indent": [ "error", 2 ],
    'curly': 1,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-explicit-any' : 'warn',
    '@typescript-eslint/no-this-alias' : 'off',
    'no-unused-vars': 0,
    "semi": [ "error", "always" ],
    "object-curly-spacing": [ "warn", "always" ],
    "array-bracket-spacing": [ "warn", "always" ],
    "@typescript-eslint/quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ]
  },
};
