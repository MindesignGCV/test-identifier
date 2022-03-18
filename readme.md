### ng-test-identifier

ESLint rule to make sure that all elements have a test identifier. (`data-test` attribute by default)

When running eslint with `--fix` option, this rule adds `data-test` attribute with random value for all elements (except `ng-container`/`router-outlet`/`ng-template`).

Random value is generated using `nanoid`, and the length and alphabet are configurable.

Example configuration:
```
{
  "rules": {
    "ng-test-identifier": ["error", {"randomTextOptions": {"length": 8, "alphabet": "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"}, "tagName": "data-test"}]
  }
}
```

