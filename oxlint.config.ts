import { subfLint } from '@subf/config/oxlint'

export default subfLint({
  ignorePatterns: ['wa-sqlite-fts5', 'wa-sqlite', 'src/vfs/class/OPFSAnyContextVFS.js'],
  rules: {
    'no-constant-condition': 'off',
    'no-unused-vars': 'off',
  },
})
