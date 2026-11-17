# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Angular 19 (standalone components, signals) email signature generator for inVerita. The same codebase ships two ways:

- **Web app** on GitHub Pages, served under `/email-signature/`.
- **Chrome extension** (Manifest V3). `manifest.json` (repo root) and `src/background.js` are copied into the build output as assets. The app runs as the extension's **options page** (it opens in a tab, not a popup); clicking the toolbar icon calls `chrome.runtime.openOptionsPage()`.

## Commands

```bash
npm start                    # ng serve, development config (baseHref /app/)
npm run build                # production build -> dist/signature/browser, baseHref /email-signature/
npm run build:extension      # extension build: baseHref ./, outputHashing none
npm test                     # Karma + Jasmine (watch mode)
npm test -- --watch=false --browsers=ChromeHeadless   # single run, as CI does
npx ng test --include src/app/signature/signature.component.spec.ts   # one spec file
```

There is no linter configured. To load the extension, run `build:extension`, then use "Load unpacked" on `dist/signature/` in `chrome://extensions` (see `EXTENSION_SETUP.md`).

The `.cursor/commands/update.md` workflow is: build, build the extension, commit, then push to all remotes.

## Build configurations matter for asset URLs

Each Angular build configuration sets a different `baseHref` (`/email-signature/`, `/app/`, `./`), so asset paths must never be built from `window.location.origin` alone. `resolveAssetFetchUrl()` in `src/app/store/signature.store.ts` is the single place that resolves an asset path. It tries, in order: `chrome.runtime.getURL` (extension), then `document.baseURI` (respects baseHref), then the origin. Route any new asset fetch through it.

The extension CSP in `manifest.json` allows `'wasm-unsafe-eval'` for TensorFlow.js and `img-src data: https:`. Keep both if you touch the CSP.

## Architecture

The app has a single lazy route (`app.routes.ts`) that loads `SignatureComponent`. Nearly all logic lives in two files:

- **`src/app/store/signature.store.ts`** is an `@ngrx/signals` `signalStore` (root-provided, ~2k lines). It owns:
  - State (`SignatureState`) plus the `SignatureVariant` enum (9 layouts).
  - **The HTML generation for each variant** (`generate<Variant>Variant` methods). `generateEmailSignature()` dispatches on `variant`, and `generateEmailHtml()` wraps the result in a full document.
  - `convertImagesToBase64()`, which inlines every image as a data URL so the copied HTML works in email clients. Social icons are preloaded into a base64 cache on init. Some variants use the `-b` icon set (`*-fill-b.png`).
  - Persistence, which has **two layers**:
    1. `LocalStorageService` (`localStorage`, key `signaturePersonalData`) stores the personal fields: name, title, linkedInUrl and imageUrl.
    2. `chrome.storage.local` (key `signatureState`) stores the whole state. It is used only when running as an extension, and personal fields from it are ignored on load in favour of layer 1.

    Both layers are written by `effect()`s that are set up in `onInit` through `runInInjectionContext`, because the hook is async.
  - inVerita's social and website URLs are **hardcoded constants** that are exposed as computed values. They are not user-editable, even though they appear in `SignatureState`.
- **`src/app/signature/signature.component.ts`** holds the form UI (reactive forms), the live preview (base64 HTML through `bypassSecurityTrustHtml`), photo upload, and copy-to-clipboard. Selecting a variant only sets `pendingVariant`. The variant is committed when the user clicks "Activate Card" on the Review and Confirm step.
- **`src/app/services/image-processor.service.ts`** handles uploaded portraits. It uses TensorFlow.js BlazeFace face detection, preferring the WebGL backend and falling back to CPU, to crop and center the face, and returns a base64 image. It has Safari-specific handling: MIME sniffing, `img.decode()`, and the `accept` attribute.

### Email-client HTML constraints

The generated signature HTML must survive Gmail and Outlook. Follow these rules:

- Use table-based layout (`role="presentation"`, `cellspacing`/`cellpadding`/`border="0"`).
- Use inline styles only.
- Inline images as base64.
- Keep the MSO conditional comments in `generateEmailHtml`.

`src/app/signature/signature-email.html` is a static reference template that nothing imports. `signature-email-test/` is a scratch component with no route.

### Clipboard

Copying has to work in Safari. `tryCopyEmailPreviewHtml` tries these methods in order:

1. `ClipboardItem` with `text/html`.
2. `execCommand('copy')` on a hidden contentEditable div, which keeps rich text.
3. `clipboard.writeText`.
4. `execCommand` on a textarea.

Keep this fallback chain intact.

## Deployment and remotes

The workflows in `.github/workflows/` are gated by `github.repository`, so each one runs only on its intended repo:

- `InVeritaSoft/email-signature` (the current `origin`): `hosting-workflow.yml` runs `npm run build` and deploys `dist/signature/browser` to GitHub Pages on every push to `main`.
- `InVeritaSoft/email-signature-generator`: `origin-workflow.yml` runs tests and the build, and `deploy-policies.yml` publishes `policies/` (the privacy policy) to Pages.

When releasing the extension, bump `version` in both `package.json` and `manifest.json`.
