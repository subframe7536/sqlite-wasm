import { subfFmt } from '@subf/config/oxfmt'

export default subfFmt({
  ignorePatterns: ['wa-sqlite-fts5', 'wa-sqlite', 'src/vfs/class/OPFSAnyContextVFS.js'],
})
