# Chrome Web Store Permission Justification

## Required Permissions

### 1. `storage`

**Permission Type:** Host permission (Chrome Storage API)

**Justification:**
The `storage` permission is essential for the extension's core functionality. It is used to:
- **Save user signature data locally** - Store the user's name, title, contact information, social media links, uploaded images, and selected signature style
- **Persist data across browser sessions** - Allow users to return to the extension and find their previously entered signature information
- **Enable data synchronization** - Sync signature data across the user's devices when Chrome sync is enabled

**Usage in Code:**
- `chrome.storage.local.get()` - Loads saved signature state when the extension opens
- `chrome.storage.local.set()` - Saves signature data whenever the user makes changes
- `chrome.storage.local.remove()` - Clears saved data when user resets the signature

**Why it's necessary:**
Without the `storage` permission, users would have to re-enter all their signature information every time they open the extension, which would severely degrade the user experience and make the extension impractical to use.

**Directly related to single purpose:**
This permission is directly tied to the extension's single purpose of generating email signatures, as it allows the extension to remember and persist the user's signature configuration.

---

### 2. `clipboardWrite`

**Permission Type:** Host permission (Clipboard API)

**Justification:**
The `clipboardWrite` permission is essential for the extension's primary function. It is used to:
- **Copy generated HTML signature to clipboard** - Allow users to copy the generated email signature HTML code with a single click
- **Enable one-click signature copying** - Provide the core user workflow of generating and copying signatures for use in email clients

**Usage in Code:**
- `navigator.clipboard.writeText()` - Copies the generated HTML signature as text to the clipboard
- `navigator.clipboard.write()` - Copies formatted HTML content to clipboard (for rich text email clients)

**Why it's necessary:**
The extension's primary value proposition is to generate email signatures that users can easily copy and paste into their email clients. Without the ability to write to the clipboard, users would have to manually select and copy the signature text, which defeats the purpose of the extension.

**Directly related to single purpose:**
This permission is the core mechanism that enables the extension's single purpose: generating email signatures that users can easily use in their email clients.

---

## Summary

Both permissions (`storage` and `clipboardWrite`) are:
1. **Essential** - The extension cannot fulfill its purpose without them
2. **Minimal** - Only the absolute minimum permissions required
3. **Directly related** - Both are directly tied to the single purpose of generating email signatures
4. **User-beneficial** - Both enhance the user experience in clear, necessary ways

No unnecessary permissions are requested. The extension does not:
- Access web page content (no content scripts)
- Access user browsing data
- Make network requests to external servers
- Access user's personal information beyond what they explicitly enter

