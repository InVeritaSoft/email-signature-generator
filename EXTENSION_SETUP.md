# Chrome Extension Setup Guide

This project has been converted to a Chrome Extension. Follow these steps to build and load the extension.

## Building the Extension

1. Build the extension using the new build script:
   ```bash
   npm run build:extension
   ```

2. The built extension will be in the `dist/signature/` directory.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist/signature/` directory
5. The extension should now appear in your extensions list

## Using the Extension

1. Click the extension icon in the Chrome toolbar (or right-click and select "Options")
2. The signature generator will open in a new tab (options page)
3. Fill in your signature details
4. Your data is automatically saved to Chrome Storage
5. Click "Copy HTML to Clipboard" to copy your signature

**Note**: The extension now uses an options page instead of a popup, which allows for a wider window and better user experience.

## Features

- **Persistent Storage**: All signature data is saved to Chrome Storage and persists across sessions
- **Asset Handling**: Images and assets are properly resolved for extension context
- **Chrome Storage Integration**: State is automatically synced to Chrome Storage API

## Development

- Regular web build: `npm run build`
- Extension build: `npm run build:extension`
- Development server: `npm start` (for web development)

## Notes

- The extension uses Manifest V3
- Icons are currently using the same logo.png for all sizes (16x16, 48x48, 128x128)
- For production, consider creating properly sized icons
- The extension uses an options page (opens in a new tab) instead of a popup for better width and usability

