import { subfLint } from '@subf/config/oxlint'

export default subfLint({
  ignorePatterns: [
    'wa-sqlite-fts5',
    'wa-sqlite',
  ],
  rules: {
    'no-constant-condition': 'off',
    'no-unused-vars': 'off',
  },
})
