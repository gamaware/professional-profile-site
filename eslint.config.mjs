export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        console: "readonly",
        IntersectionObserver: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      eqeqeq: "error",
      "no-eval": "error",
      "no-implied-eval": "error",
    },
  },
  {
    // Tests, the local server and tool configuration run in Node, with
    // browser globals only inside page callbacks.
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        getComputedStyle: "readonly",
        requestAnimationFrame: "readonly",
        performance: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      eqeqeq: "error",
      "no-eval": "error",
      "no-implied-eval": "error",
    },
  },
];
