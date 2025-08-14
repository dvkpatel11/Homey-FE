module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [
          ["@", "./src"],
          ["@components", "./src/components"],
          ["@pages", "./src/pages"],
          ["@contexts", "./src/contexts"],
          ["@hooks", "./src/hooks"],
          ["@lib", "./src/lib"],
          ["@utils", "./src/lib/utils"],
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  plugins: ["react-refresh", "jsx-a11y", "import"],
  rules: {
    // React-specific rules
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react/display-name": "off",
    "react/no-unescaped-entities": "warn",

    // General JavaScript rules
    "no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "warn",
    "prefer-template": "warn",

    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Accessibility rules (relaxed for development)
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-a11y/no-autofocus": "off", // Sometimes needed for UX

    // Import rules
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always-and-inside-groups",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unresolved": "off", // Handled by bundler
    "import/named": "off", // Handled by bundler
    "import/default": "off", // Handled by bundler
    "import/namespace": "off", // Handled by bundler

    // Performance rules
    "prefer-object-spread": "warn",
    "no-duplicate-imports": "error",

    // Code quality rules
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-implicit-coercion": "warn",
    "no-return-await": "warn",
    "require-await": "warn",
  },

  overrides: [
    {
      files: ["*.config.js", "*.config.cjs"],
      env: {
        node: true,
        browser: false,
      },
    },
    {
      rules: {
        "no-console": "off", // Allow console.log in mock data
      },
    },
  ],
};
