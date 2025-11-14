import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { GRADIENTS } from '../constants/colors';

export enum SignatureVariant {
  Classic = 'classic',
  Dark = 'dark',
  Gradient = 'gradient',
  Vertical = 'vertical',
  Quadrant = 'quadrant',
  HorizontalLogo = 'horizontal-logo',
  GradientBlue = 'gradient-blue',
  HorizontalSimple = 'horizontal-simple',
  VerticalSimple = 'vertical-simple',
}

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
  variant: SignatureVariant;
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
  variant: SignatureVariant.Classic,
};

// Image assets (hardcoded - not editable)
const logoUrl = 'assets/logo.png';
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
      variant: store.variant(),
    })),
  })),
  withMethods((store) => {
    // Cache for base64 images
    const base64Cache = new Map<string, string>();

    // Helper function to convert image to base64
    const imageToBase64 = async (imagePath: string): Promise<string> => {
      // If already a base64 data URL, return as-is
      if (imagePath.startsWith('data:image/')) {
        return imagePath;
      }

      // Check cache first
      if (base64Cache.has(imagePath)) {
        return base64Cache.get(imagePath)!;
      }

      try {
        // Resolve relative paths (assets/*) to absolute URLs
        let resolvedPath = imagePath;
        if (
          imagePath.startsWith('assets/') ||
          imagePath.startsWith('/assets/')
        ) {
          // For relative asset paths, resolve to current origin
          const basePath = imagePath.startsWith('/')
            ? imagePath
            : `/${imagePath}`;
          resolvedPath = `${window.location.origin}${basePath}`;
        } else if (
          !imagePath.startsWith('http://') &&
          !imagePath.startsWith('https://') &&
          !imagePath.startsWith('data:')
        ) {
          // For other relative paths, resolve to current origin
          const basePath = imagePath.startsWith('/')
            ? imagePath
            : `/${imagePath}`;
          resolvedPath = `${window.location.origin}${basePath}`;
        }

        // Fetch the image
        const response = await fetch(resolvedPath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image: ${resolvedPath} (${response.status})`
          );
        }
        const blob = await response.blob();

        // Convert to base64
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            base64Cache.set(imagePath, base64);
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error(`Failed to convert image to base64: ${imagePath}`, error);
        // Return original path as fallback
        return imagePath;
      }
    };

    // Helper function to get image URL with base URL
    const getImageUrl = (
      relativePath: string,
      baseUrlOverride: string = '',
      stateOverride?: SignatureState,
      useBase64: boolean = false
    ) => {
      // If useBase64 is true, return the path as-is (will be converted later)
      if (useBase64) {
        return relativePath;
      }

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

      updateVariant(variant: SignatureVariant): void {
        patchState(store, { variant });
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
       * Converts all image src attributes in HTML to base64
       * @param html - HTML string with image src attributes
       * @returns Promise that resolves to HTML with base64 image src
       */
      async convertImagesToBase64(html: string): Promise<string> {
        // Extract all image src attributes
        const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const imageUrls = new Set<string>();
        let match;

        while ((match = imgSrcRegex.exec(html)) !== null) {
          const imageUrl = match[1];
          // Skip if already base64 data URL
          if (!imageUrl.startsWith('data:image/')) {
            imageUrls.add(imageUrl);
          }
        }

        // If all images are already base64, return as-is
        if (imageUrls.size === 0) {
          return html;
        }

        // Convert all images to base64
        const base64Map = new Map<string, string>();
        await Promise.all(
          Array.from(imageUrls).map(async (url) => {
            try {
              const base64 = await imageToBase64(url);
              // Only update if conversion was successful (not fallback to original)
              if (base64 && base64.startsWith('data:image/')) {
                base64Map.set(url, base64);
              }
            } catch (error) {
              console.error(`Failed to convert image ${url} to base64:`, error);
            }
          })
        );

        // Replace all image src attributes with base64
        let result = html;
        base64Map.forEach((base64, url) => {
          // Escape special regex characters in URL
          const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`src=["']${escapedUrl}["']`, 'gi');
          result = result.replace(regex, `src="${base64}"`);
        });

        return result;
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
          variant: store.variant(),
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
        const variant = state.variant || SignatureVariant.Classic;

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

        // Route to appropriate variant template
        switch (variant) {
          case SignatureVariant.Dark:
            return this.generateDarkVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.Gradient:
            return this.generateGradientVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.Vertical:
            return this.generateVerticalVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.Quadrant:
            return this.generateQuadrantVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.HorizontalLogo:
            return this.generateHorizontalLogoVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.GradientBlue:
            return this.generateGradientBlueVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.HorizontalSimple:
            return this.generateHorizontalSimpleVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          case SignatureVariant.VerticalSimple:
            return this.generateVerticalSimpleVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
          default:
            return this.generateClassicVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconUrlValue,
              youtubeIconUrlValue,
              linkedInIconUrlValue
            );
        }
      },

      generateClassicVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #fbfbfb; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <!-- Content Table -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fbfbfb;">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background-color: #ffffff;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fbfbfb;">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0; background-color: #E6E7E8;">
                  <img src="${portraitUrl}" alt="${name}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0; background: linear-gradient(30deg, #0072DA 0%, #0056b3 100%); height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="background-color: #ffffff; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fbfbfb;">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #e6e7e8; padding: 20px; width: 100%;">
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
                      <td style="padding: 0; height: 60px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #e6e7e8; height: 24px; line-height: 24px;">
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
                <td style="background-color: #808080; padding: 0;">
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
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
                              </a>
                            </td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 60px; text-align: center; vertical-align: middle;">
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

      generateDarkVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #231F20; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <!-- Content Table -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #231F20;">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background-color: #E6E7E8;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #E6E7E8;">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0; background-color: #E6E7E8;">
                  <img src="${portraitUrl}" alt="${name}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0; background-color: #231F20; height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="background-color: #231F20; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #231F20;">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #231F20; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 60px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #231F20; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #FFFFFF;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Social Media Section with Gradient -->
              <tr>
                <td style="background: ${GRADIENTS.blue}; padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
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

      generateGradientVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: ${GRADIENTS.default}; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td style="padding: 0; background: ${GRADIENTS.default};">
      <!-- Content Table with spacer cells for inner gaps only -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.default};">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background: ${GRADIENTS.default};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.default};">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0; background-color: #E6E7E8;">
                  <img src="${portraitUrl}" alt="${name}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Spacer for gap between photo and logo -->
              <tr>
                <td style="padding: 0; height: 1px; line-height: 1px; font-size: 1px; background: ${GRADIENTS.default};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="180" height="1" style="display: block; width: 180px; height: 1px; border: 0;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0; background-color: #0072DA; height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Spacer cell for gap between left and right columns -->
          <td width="1" valign="top" style="width: 1px; padding: 0; background: ${GRADIENTS.default}; vertical-align: top;">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="1" height="241" style="display: block; width: 1px; height: 241px; border: 0; background: ${GRADIENTS.default};" />
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="padding: 0; vertical-align: top; background: ${GRADIENTS.default};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.default};">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: transparent; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 60px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: transparent; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #FFFFFF;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Spacer for gap between personal and social sections -->
              <tr>
                <td style="padding: 0; height: 1px; line-height: 1px; font-size: 1px; background: ${GRADIENTS.default};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100%" height="1" style="display: block; width: 100%; height: 1px; border: 0;" />
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: transparent; padding: 0; border-top: 1px solid #FFFFFF; height: 59px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 59px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
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

      generateVerticalVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: linear-gradient(to bottom, #0072DA, #64CCC9); padding: 20px; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <!-- Logo -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 20px 0; height: 60px; text-align: center; vertical-align: middle; background-color: transparent;">
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
          </td>
        </tr>
      </table>
      
      <!-- Name and Title -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 4px 0;">
            <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
              ${name}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 0;">
            <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
              ${title}
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Links -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 8px 0;">
            <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
              ${linkedInText}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 0;">
            <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
              ${websiteText}
            </a>
          </td>
        </tr>
      </table>
      
      <!-- Social Media Icons -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 0 14px 0 0;">
            <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
            </a>
          </td>
          <td style="padding: 0 14px 0 0;">
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
            </a>
          </td>
          <td style="padding: 0;">
            <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
      },

      generateQuadrantVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #231F20; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td style="padding: 0; background-color: #231F20;">
      <!-- Content Table with spacer cells for inner gaps only -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #231F20;">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background-color: #231F20;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #231F20;">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0; background-color: #E6E7E8;">
                  <img src="${portraitUrl}" alt="${name}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Spacer for gap between photo and logo -->
              <tr>
                <td style="padding: 0; height: 2px; line-height: 2px; font-size: 2px; background: ${GRADIENTS.blue};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="180" height="2" style="display: block; width: 180px; height: 2px; border: 0;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0; background-color: #231F20; height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Spacer cell for gap between left and right columns -->
          <td width="2" style="width: 2px; padding: 0; background: ${GRADIENTS.blue};">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="2" height="242" style="display: block; width: 2px; height: 242px; border: 0;" />
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="padding: 0; vertical-align: top; background-color: #231F20;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #231F20;">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #231F20; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 60px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #231F20; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #FFFFFF;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Spacer for gap between personal and social sections -->
              <tr>
                <td style="padding: 0; height: 2px; line-height: 2px; font-size: 2px; background: ${GRADIENTS.blue};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100%" height="2" style="display: block; width: 100%; height: 2px; border: 0;" />
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: #231F20; padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
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

      generateHorizontalLogoVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: linear-gradient(to right, #0072DA, #64CCC9); padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(to right, #0072DA, #64CCC9);">
        <tr>
          <!-- Logo on Left -->
          <td valign="middle" width="180" style="width: 180px; padding: 20px; vertical-align: middle; background-color: transparent; text-align: center;">
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
          </td>
          <!-- Text on Right -->
          <td valign="top" style="padding: 20px 20px 20px 0; vertical-align: top; background-color: transparent;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 0 4px 0;">
                  <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
                    ${name}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 12px 0;">
                  <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
                    ${title}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 8px 0;">
                  <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
                    ${linkedInText}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 8px 0;">
                  <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px;">
                    ${websiteText}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding: 0 14px 0 0;">
                        <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                          <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                        </a>
                      </td>
                      <td style="padding: 0 14px 0 0;">
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                          <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                        </a>
                      </td>
                      <td style="padding: 0;">
                        <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                          <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
</table>`;
      },

      generateGradientBlueVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: ${GRADIENTS.blue}; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td style="padding: 0; background: ${GRADIENTS.blue};">
      <!-- Content Table with spacer cells for inner gaps only -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.blue};">
        <tr>
          <!-- Left Column: Portrait and Logo -->
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background: ${GRADIENTS.blue};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.blue};">
              <!-- Portrait Image -->
              <tr>
                <td style="padding: 0; background-color: #E6E7E8;">
                  <img src="${portraitUrl}" alt="${name}" width="180" height="180" style="display: block; width: 180px; height: 180px; object-fit: cover; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
              <!-- Spacer for gap between photo and logo -->
              <tr>
                <td style="padding: 0; height: 1px; line-height: 1px; font-size: 1px; background: ${GRADIENTS.blue};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="180" height="1" style="display: block; width: 180px; height: 1px; border: 0;" />
                </td>
              </tr>
              <!-- Logo -->
              <tr>
                <td style="padding: 0; background-color: #FFFFFF; height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0);" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Spacer cell for gap between left and right columns -->
          <td width="1" valign="top" style="width: 1px; padding: 0; background: ${GRADIENTS.blue}; vertical-align: top;">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="1" height="241" style="display: block; width: 1px; height: 241px; border: 0; background: ${GRADIENTS.blue};" />
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="padding: 0; vertical-align: top; background: ${GRADIENTS.blue};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${GRADIENTS.blue};">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: transparent; padding: 20px; width: 100%;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <!-- Name -->
                    <tr>
                      <td style="padding: 0 0 4px 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #FFFFFF;">
                          ${name}
                        </p>
                      </td>
                    </tr>
                    <!-- Title -->
                    <tr>
                      <td style="padding: 0;">
                        <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #FFFFFF;">
                          ${title}
                        </p>
                      </td>
                    </tr>
                    <!-- Spacer -->
                    <tr>
                      <td style="padding: 0; height: 60px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: transparent; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #FFFFFF;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Spacer for gap between personal and social sections -->
              <tr>
                <td style="padding: 0; height: 1px; line-height: 1px; font-size: 1px; background: ${GRADIENTS.blue};">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100%" height="1" style="display: block; width: 100%; height: 1px; border: 0;" />
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: transparent; padding: 0; border-top: 1px solid #FFFFFF; border-left: 1px solid #FFFFFF; height: 59px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
                              </a>
                            </td>
                            <!-- Website Link -->
                            <td style="padding: 0 8px; height: 59px; text-align: center; vertical-align: middle;">
                              <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
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

      generateHorizontalSimpleVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="400" style="background-color: #ffffff; padding: 0; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <table role="presentation" cellspacing="10" cellpadding="0" border="0" width="100%" style="background-color: #ffffff;">
        <tr>
          <!-- Logo on Left -->
          <td valign="middle" width="140" style="width: 140px; padding: 10px 20px; vertical-align: middle; background-color: #0072DA; text-align: center;">
            <img src="${logoUrlValue}" alt="Inverita logo" width="140" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
          </td>
          <!-- Text on Right -->
          <td valign="top" style="padding: 20px 20px 20px 0; vertical-align: top; background-color: #ffffff;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding: 0 0 4px 0;">
                  <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #000000;">
                    ${name}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 12px 0;">
                  <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #000000;">
                    ${title}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0;">
                  <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #000000; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
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
</table>`;
      },

      generateVerticalSimpleVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconUrlValue: string,
        youtubeIconUrlValue: string,
        linkedInIconUrlValue: string
      ): string {
        const name = state.name || '';
        const title = state.title || '';
        const linkedInUrl = state.linkedInUrl || '';
        const linkedInText = state.linkedInText || '';
        const websiteUrl = state.websiteUrl || '';
        const websiteText = state.websiteText || '';
        const facebookUrl = state.facebookUrl || '';
        const youtubeUrl = state.youtubeUrl || '';
        const linkedInSocialUrl = state.linkedInSocialUrl || '';

        return `<!-- Main Container Table -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="400" style="background-color: #ffffff; padding: 20px; margin: 0 auto; border: 0;">
  <tr>
    <td>
      <!-- Logo -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 20px 0; height: 60px; text-align: center; vertical-align: middle; background-color: #0072DA;">
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="25" style="display: block; width: auto; height: 25px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
          </td>
        </tr>
      </table>
      
      <!-- Name and Title -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 4px 0;">
            <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 20px; font-weight: 600; line-height: 28px; color: #000000;">
              ${name}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 0 0 20px 0;">
            <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px; color: #000000;">
              ${title}
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Website Link -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 0 0 20px 0;">
            <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #000000; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px;">
              ${websiteText}
            </a>
          </td>
        </tr>
      </table>
      
      <!-- Social Media Icons -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 0 14px 0 0;">
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${youtubeIconUrlValue}" alt="YouTube" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
            </a>
          </td>
          <td style="padding: 0 14px 0 0;">
            <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${facebookIconUrlValue}" alt="Facebook" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
            </a>
          </td>
          <td style="padding: 0;">
            <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              <img src="${linkedInIconUrlValue}" alt="LinkedIn" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />
            </a>
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
        // Use generateEmailSignature which already handles variants
        const signature = this.generateEmailSignature(
          baseUrlOverride,
          stateOverride
        );

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
