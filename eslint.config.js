// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["docs/**/*.js", "webpack.config.ts"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      // Use index-signature if you want to name the index, otherwise use record-style.
      // In other words, use record-style if you want to use the meaning-less name like "key" or "index" for the index.
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  }
);
