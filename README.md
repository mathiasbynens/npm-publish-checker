# `npm-publish-checker` [![npm-publish-checker on npm](https://img.shields.io/npm/v/npm-publish-checker)](https://www.npmjs.com/package/npm-publish-checker)

A CLI to check if the latest version of a package is correctly published by comparing the `time` and `versions` properties in the registry.

## Usage

To check a specific package name and version:

```bash
npx npm-publish-checker puppeteer-core@25.0.0
```

Alternatively, to check the latest version:

```bash
npx npm-publish-checker puppeteer-core
```

## How it works

The script fetches the registry data for the specified package and:

1. If no version is specified, it compares the version with the latest timestamp in the `time` object with the most recent version in the `versions` object.
2. If a version is specified, it checks if that version is present in both the `time` and `versions` objects.

If there is a discrepancy, it flags it.

## Why

[npm’s automated processes might decide to silently unpublish packages.](https://github.com/puppeteer/puppeteer/issues/14986#issuecomment-4459734551) This tool provides an easy way to find out whether this has happened, or whether you’re just observing a registry caching issue.
