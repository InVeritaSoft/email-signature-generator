import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';

export interface SignatureState {
  name: string;
  title: string;
  linkedInUrl: string;
  linkedInText: string;
  websiteUrl: string;
  websiteText: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedInSocialUrl: string;
  imageUrl: string;
  baseUrl: string;
}

const initialState: SignatureState = {
  name: 'Zoryan Hudziy',
  title: 'CEO, Co-founder Inverita',
  linkedInText: 'Zoryan on LinkedIn',
  linkedInUrl: 'https://www.linkedin.com/in/zoryan-hudziy',
  websiteUrl: 'https://inveritasoft.com',
  websiteText: 'inveritasoft.com',
  facebookUrl: 'https://www.facebook.com/inveritasoft',
  youtubeUrl: 'https://www.youtube.com/@inveritasoft',
  linkedInSocialUrl: 'https://www.linkedin.com/company/inveritasoft',
  imageUrl: 'assets/f629c4c2df25111d7773a91610d6528d1a8cb5bb.png',
  baseUrl: '',
};

// Image assets (hardcoded - not editable)
const logoUrl = 'assets/516f9476ae82f86dc9aed7edb53d662b1027a057.svg';
const facebookIconUrl = 'assets/86fe2a2a805b38a53a570fffbfcedff5bee14c6e.svg';
const youtubeIconUrl = 'assets/e954b2b256844b45a4312866e2427080e4f4680e.svg';
const linkedInIconUrl = 'assets/252ab1f841d7b12fa4ab683d55d5059552029ff1.svg';

export const SignatureStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Computed state signal that combines all individual signals
    state: computed(() => ({
      name: store.name(),
      title: store.title(),
      linkedInUrl: store.linkedInUrl(),
      linkedInText: store.linkedInText(),
      websiteUrl: store.websiteUrl(),
      websiteText: store.websiteText(),
      facebookUrl: store.facebookUrl(),
      youtubeUrl: store.youtubeUrl(),
      linkedInSocialUrl: store.linkedInSocialUrl(),
      imageUrl: store.imageUrl(),
      baseUrl: store.baseUrl(),
    })),
  })),
  withMethods((store) => {
    // Helper function to get image URL with base URL
    const getImageUrl = (
      relativePath: string,
      baseUrlOverride: string = '',
      stateOverride?: SignatureState
    ) => {
      const effectiveBaseUrl =
        baseUrlOverride || stateOverride?.baseUrl || store.baseUrl();
      if (effectiveBaseUrl) {
        return `${effectiveBaseUrl.replace(/\/$/, '')}/${relativePath.replace(
          /^\//,
          ''
        )}`;
      }
      return relativePath; // Fallback to relative if no baseUrl provided
    };

    return {
      // Update methods
      updateName(name: string): void {
        patchState(store, { name });
      },

      updateTitle(title: string): void {
        patchState(store, { title });
      },

      updateLinkedInUrl(url: string): void {
        patchState(store, { linkedInUrl: url });
      },

      updateLinkedInText(text: string): void {
        patchState(store, { linkedInText: text });
      },

      updateWebsiteUrl(url: string): void {
        patchState(store, { websiteUrl: url });
      },

      updateWebsiteText(text: string): void {
        patchState(store, { websiteText: text });
      },

      updateFacebookUrl(url: string): void {
        patchState(store, { facebookUrl: url });
      },

      updateYoutubeUrl(url: string): void {
        patchState(store, { youtubeUrl: url });
      },

      updateLinkedInSocialUrl(url: string): void {
        patchState(store, { linkedInSocialUrl: url });
      },

      updateImageUrl(url: string): void {
        patchState(store, { imageUrl: url });
      },

      updateBaseUrl(url: string): void {
        patchState(store, { baseUrl: url });
      },

      updateState(updates: Partial<SignatureState>): void {
        // Normalize all updates to ensure empty strings are properly handled
        const normalizedUpdates: Partial<SignatureState> = {};
        Object.keys(updates).forEach((key) => {
          const typedKey = key as keyof SignatureState;
          const value = updates[typedKey];
          // Normalize null/undefined to empty string for proper comparison
          normalizedUpdates[typedKey] = (
            value === null || value === undefined ? '' : String(value)
          ) as any;
        });

        // Always call patchState - it will create a new object reference
        // This ensures signals are triggered even when values change to/from empty string
        // patchState always creates a new state object, which triggers signal updates
        patchState(store, normalizedUpdates);
      },

      reset(): void {
        patchState(store, initialState);
      },

      /**
       * Generates email-compatible HTML signature (body content only, for direct insertion)
       * @param baseUrlOverride - Optional base URL override (e.g., 'https://yourdomain.com' or 'https://cdn.yourdomain.com')
       * @param stateOverride - Optional state override (for reactive computed signals)
       * @returns HTML string ready for email clients (just the signature, no html/body tags)
       */
      generateEmailSignature(
        baseUrlOverride: string = '',
        stateOverride?: SignatureState
      ): string {
        // Use provided state or get current state
        // In NgRx Signals, we need to construct state from individual signals
        const state = stateOverride || {
          name: store.name(),
          title: store.title(),
          linkedInUrl: store.linkedInUrl(),
          linkedInText: store.linkedInText(),
          websiteUrl: store.websiteUrl(),
          websiteText: store.websiteText(),
          facebookUrl: store.facebookUrl(),
          youtubeUrl: store.youtubeUrl(),
          linkedInSocialUrl: store.linkedInSocialUrl(),
          imageUrl: store.imageUrl(),
          baseUrl: store.baseUrl(),
        };
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';
        const imageUrl = state.imageUrl || '';

        const portraitUrl = getImageUrl(
          imageUrl,
          baseUrlOverride,
          stateOverride
        );
        const logoUrlValue = getImageUrl(
          logoUrl,
          baseUrlOverride,
          stateOverride
        );
        const facebookIconUrlValue = getImageUrl(
          facebookIconUrl,
          baseUrlOverride,
          stateOverride
        );
        const youtubeIconUrlValue = getImageUrl(
          youtubeIconUrl,
          baseUrlOverride,
          stateOverride
        );
        const linkedInIconUrlValue = getImageUrl(
          linkedInIconUrl,
          baseUrlOverride,
          stateOverride
        );

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #fbfbfb; padding: 4px 3px; margin: 0 auto;">
  <tr>
    <td>
      <!-- Content Table -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="160" style="width: 160px; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0;">
                  <img src="${portraitUrl}" alt="${name}" width="160" height="160" style="display: block; width: 160px; height: 160px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="160" height="40" style="display: block; width: 160px; height: 40px; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="background-color: #cbcbcb; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #fbfbfb; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #101828;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #000000;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 40px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #fbfbfb; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #6b7280;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: #cbcbcb; padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #000000; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
                                ${websiteText}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
      },

      /**
       * Generates email-compatible HTML signature (full document)
       * @param baseUrlOverride - Optional base URL override (e.g., 'https://yourdomain.com' or 'https://cdn.yourdomain.com')
       * @param stateOverride - Optional state override (for reactive computed signals)
       * @returns Complete HTML document ready for email clients
       */
      generateEmailHtml(
        baseUrlOverride: string = '',
        stateOverride?: SignatureState
      ): string {
        // Get the signature HTML by calling generateEmailSignature
        // We need to construct the state if not provided
        const state = stateOverride || {
          name: store.name(),
          title: store.title(),
          linkedInUrl: store.linkedInUrl(),
          linkedInText: store.linkedInText(),
          websiteUrl: store.websiteUrl(),
          websiteText: store.websiteText(),
          facebookUrl: store.facebookUrl(),
          youtubeUrl: store.youtubeUrl(),
          linkedInSocialUrl: store.linkedInSocialUrl(),
          imageUrl: store.imageUrl(),
          baseUrl: store.baseUrl(),
        };

        // Call generateEmailSignature inline (duplicate logic to avoid circular reference)
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';
        const imageUrl = state.imageUrl || '';

        const portraitUrl = getImageUrl(
          imageUrl,
          baseUrlOverride,
          stateOverride
        );
        const logoUrlValue = getImageUrl(
          logoUrl,
          baseUrlOverride,
          stateOverride
        );
        const facebookIconUrlValue = getImageUrl(
          facebookIconUrl,
          baseUrlOverride,
          stateOverride
        );
        const youtubeIconUrlValue = getImageUrl(
          youtubeIconUrl,
          baseUrlOverride,
          stateOverride
        );
        const linkedInIconUrlValue = getImageUrl(
          linkedInIconUrl,
          baseUrlOverride,
          stateOverride
        );

        const signature = `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #fbfbfb; padding: 4px 3px; margin: 0 auto;">
  <tr>
    <td>
      <!-- Content Table -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="160" style="width: 160px; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0;">
                  <img src="${portraitUrl}" alt="${name}" width="160" height="160" style="display: block; width: 160px; height: 160px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="160" height="40" style="display: block; width: 160px; height: 40px; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="background-color: #cbcbcb; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #fbfbfb; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #101828;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #000000;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 40px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #fbfbfb; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #6b7280;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: #cbcbcb; padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Spacer -->
                            <td style="padding: 0; width: 14px; font-size: 14px; line-height: 14px;">&nbsp;</td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #000000; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
                                ${websiteText}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Email Signature</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #fbfbfb;">
${signature}
</body>
</html>`;
      },
    };
  })
);
