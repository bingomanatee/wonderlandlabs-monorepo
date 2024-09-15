// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      indent: ["error", 2],
      curly: 1,
      "@typescript-eslint/no-unused-vars": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-this-alias": "off",
      "no-unused-vars": 0,
      semi: ["error", "always"],
      "object-curly-spacing": ["warn", "always"],
      "array-bracket-spacing": ["warn", "always"],
      quotes: [
        "error",
        "single",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
