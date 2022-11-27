const prettierConfigStandard = require('prettier-config-standard');

const modifiedConfig = {
  ...prettierConfigStandard,
  semi: true,
  parser: 'typescript',
  singleQuote: true,
  trailingComma: 'es5',
  proseWrap: 'never',
  arrowParens: 'always',
  tabWidth: 2,
};

module.exports = modifiedConfig;
