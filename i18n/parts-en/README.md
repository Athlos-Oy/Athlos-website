# i18n parts (English)

Per-page JSON snippets deep-merged on top of `i18n/en.json` at build time.

Each file follows the same nesting as en.json. Example
`pages-about.json`:

```json
{
  "pages": {
    "about": {
      "hero": { "headline": "..." },
      "body": "..."
    }
  }
}
```

Multiple authors can edit different part files without git conflicts.
A `null` value in a part removes a key from the merged dictionary.
