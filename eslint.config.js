import { defineEslintConfig } from '@subframe7536/eslint-config'

export default defineEslintConfig({
  overrideRules: {
    'antfu/no-top-level-await': 'off',
  },
  ignoreAll: ['./wa-sqlite-fts5'],
})
