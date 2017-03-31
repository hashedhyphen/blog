module.exports = {
  extends: 'eslint:recommended',

  parserOptions: {
    ecmaVersion: 2017,
    sourceTypes: 'module'
  },

  env: {
    browser: true,
    node: true,
    es6: true
  },

  rules: {
    'no-console': 'warn',
    semi: 'error',
  }
}
