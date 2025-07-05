module.exports = {
  env: {
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Enforces consistent indentation
    'indent': ['error', 2],
    
    // Enforces the use of single quotes
    'quotes': ['error', 'single'],
    
    // Requires semicolons
    'semi': ['error', 'always'],
    
    // Disallows unused variables
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    
    // Enforces consistent line endings
    'linebreak-style': ['error', 'unix'],
    
    // Warns about console.log statements
    'no-console': 'warn',
    
    // Enforces consistent spacing
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // Enforces trailing commas where valid
    'comma-dangle': ['error', 'never'],
    
    // Enforces consistent spacing around operators
    'space-infix-ops': 'error',
    
    // Enforces spacing before blocks
    'space-before-blocks': 'error',
    
    // Enforces consistent spacing inside parentheses
    'space-in-parens': ['error', 'never'],
    
    // Requires space before function parentheses
    'space-before-function-paren': ['error', 'never'],
    
    // Enforces consistent spacing around keywords
    'keyword-spacing': 'error',
    
    // Enforces consistent spacing around commas
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    
    // Enforces consistent brace style
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    
    // Disallows multiple empty lines
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    
    // Requires or disallows trailing commas
    'comma-dangle': ['error', 'never']
  }
};