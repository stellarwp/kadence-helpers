# Releasing Kadence Helpers

## Overview
* `@kadence/helpers` is not published to npm. Kadence Blocks and Kadence Blocks Pro install it straight from GitHub by tag (`github:stellarwp/kadence-helpers#X.Y.Z`), so a release is a version bump on `main`, a tag, and a bump in each plugin that needs it.
* There is no zip to test. A new tag changes nothing until a plugin bumps it, so QA happens on that plugin's PR.
* Ticket PRs go into a `release/<codename>` branch (e.g. `release/M26.tangela`). The release PR from that branch is what targets `main`. A feature PR can also go straight to `main`, as 1.1.1 did.
* This repo has no workflows: no CI, no release automation. The tests, the tag and the GitHub Release are all manual.
* Kadence Components is released the same way, with two differences (see "Good to know").

## Before the release PR
Commit these changes to the release branch itself, not to a new branch.
1. Bump `version` in `package.json`. That is the only place the version lives, because `package-lock.json` is not tracked here.
2. Replace every `@since TBD` with the release version. `git grep -niI "since TBD" -- src __tests__` should return nothing.
3. Run `npm install && npm test`, since there is no CI to do it.
4. Open the release PR into `main`. List the ticket PRs in its description.

## Release
1. Merge the release PR into `main` with a merge commit, not a squash (1.1.1 and 1.1.2 were merged that way).
2. Tag the merge commit and publish the GitHub Release in one step. Please check first that `main` still points at the merge commit:
   `gh release create X.Y.Z --target main --title X.Y.Z --generate-notes`
3. Check that the tag points at the merge commit and that the release shows as Latest.
4. In each plugin that needs the release, set `@kadence/helpers` to `github:stellarwp/kadence-helpers#X.Y.Z` in `package.json` and commit it with the regenerated lockfile:
   * Kadence Blocks: `bun install`, then commit `package.json` and `bun.lock`.
   * Kadence Blocks Pro: `npm install`, then commit `package.json` and `package-lock.json`.
5. Check that the lockfile resolves to the new tag and that the plugin PR is green.

## Good to know
* Please tag before bumping a plugin. A plugin cannot resolve a tag that does not exist yet. If Components is part of the release, tag both first.
* Tags are plain versions with no `v` (`1.1.2`).
* Please do not move or reuse a tag. `bun.lock` stores the commit the tag pointed to, so a moved tag is not picked up. Ship the next patch version instead.
* Nothing publishes the package. `publishConfig` points at GitHub Packages, but no workflow uses it.
* `dist/` is not committed. After `bun install`, Blocks builds it in `node_modules` (the `postinstall` script runs `build:packages`), so there is nothing to build for a release.
* There is no changelog file. The release notes are the generated GitHub Release, so please give PRs clear titles.
* Kadence Components differs in two ways: it also tracks `package-lock.json`, and its Release PR Validation check fails a `release/<version>` PR unless `package.json` and `package-lock.json` both match the version in the branch name.
