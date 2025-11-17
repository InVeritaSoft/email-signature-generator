import { computed, effect } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
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

// Random job titles for default position
const randomTitles = [
  'Software Engineer',
  'Product Manager',
  'Marketing Director',
  'Sales Executive',
  'Designer',
  'Developer',
  'Project Manager',
  'Business Analyst',
  'Data Scientist',
  'UX Designer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Technical Lead',
  'Engineering Manager',
  'CTO',
  'CEO',
  'CFO',
  'CMO',
  'VP of Engineering',
  'VP of Sales',
  'VP of Marketing',
  'Senior Developer',
  'Senior Designer',
  'Consultant',
  'Architect',
  'Team Lead',
  'Scrum Master',
  'Product Owner',
  'Business Development Manager',
  'Account Manager',
  'Content Manager',
  'Social Media Manager',
  'HR Manager',
  'Operations Manager',
  'Customer Success Manager',
  'Growth Hacker',
  'Digital Marketing Specialist',
];

// Helper to get random title
const getRandomTitle = (): string => {
  return randomTitles[Math.floor(Math.random() * randomTitles.length)];
};

const initialState: SignatureState = {
  name: 'John Doe',
  title: getRandomTitle(),
  linkedInText: 'John on LinkedIn',
  linkedInUrl: 'https://www.linkedin.com/in/john-doe',
  websiteUrl: 'https://inveritasoft.com',
  websiteText: 'inveritasoft.com',
  facebookUrl: 'https://www.facebook.com/inveritasoft',
  youtubeUrl: 'https://www.youtube.com/@inveritasoft',
  linkedInSocialUrl: 'https://www.linkedin.com/company/inveritasoft',
  imageUrl: 'https://i.pravatar.cc/180?img=' + Math.floor(Math.random() * 70),
  baseUrl: '',
  variant: SignatureVariant.Classic,
};

// Image assets (hardcoded - not editable)
const logoUrl = 'assets/logo.png';

// Social icon PNG assets
const FACEBOOK_ICON_PATH = 'assets/facebook-fill.png';
const YOUTUBE_ICON_PATH = 'assets/youtube-fill.png';
const LINKEDIN_ICON_PATH = 'assets/linkedin-fill.png';

// Social icon PNG assets for Classic variant (with -b suffix)
const FACEBOOK_ICON_PATH_B = 'assets/facebook-fill-b.png';
const YOUTUBE_ICON_PATH_B = 'assets/youtube-fill-b.png';
const LINKEDIN_ICON_PATH_B = 'assets/linkedin-fill-b.png';

// Cache for pre-converted base64 social icons
const socialIconBase64Cache = new Map<string, string>();

// Helper to load PNG image and convert to base64 data URL
const loadPngToBase64 = async (imagePath: string): Promise<string> => {
  // Check cache first
  if (socialIconBase64Cache.has(imagePath)) {
    return socialIconBase64Cache.get(imagePath)!;
  }

  try {
    // Determine the full URL based on context (Chrome extension vs web)
    let fullUrl: string;
    if (
      typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.getURL
    ) {
      // Chrome extension context
      fullUrl = chrome.runtime.getURL(imagePath);
    } else {
      // Web context - use relative path or construct from window.location
      fullUrl = imagePath.startsWith('http')
        ? imagePath
        : `${window.location.origin}/${imagePath}`;
    }

    // Fetch the image
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Convert blob to base64
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Cache the result
        socialIconBase64Cache.set(imagePath, base64);
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load PNG to base64 for ${imagePath}:`, error);
    return '';
  }
};

// Pre-load social icons to base64 (call this once at module initialization)
let socialIconsLoaded = false;
const preloadSocialIcons = async (): Promise<void> => {
  if (socialIconsLoaded) return;

  try {
    await Promise.all([
      loadPngToBase64(FACEBOOK_ICON_PATH),
      loadPngToBase64(YOUTUBE_ICON_PATH),
      loadPngToBase64(LINKEDIN_ICON_PATH),
      loadPngToBase64(FACEBOOK_ICON_PATH_B),
      loadPngToBase64(YOUTUBE_ICON_PATH_B),
      loadPngToBase64(LINKEDIN_ICON_PATH_B),
    ]);
    socialIconsLoaded = true;
  } catch (error) {
    console.error('Failed to pre-load social icons:', error);
  }
};

// Get social icon as base64 img tag (synchronous - uses cached base64, loads on-demand if needed)
// These functions return img tags with pre-converted base64 PNG data
// Variant determines which icon set to use: Classic uses -b versions, others use regular versions
const getFacebookIconImg = (
  variant: SignatureVariant = SignatureVariant.Classic
): string => {
  const iconPath =
    variant === SignatureVariant.Classic
      ? FACEBOOK_ICON_PATH_B
      : FACEBOOK_ICON_PATH;
  let base64 = socialIconBase64Cache.get(iconPath);
  if (!base64) {
    const fallbackPath =
      variant === SignatureVariant.Classic
        ? 'assets/facebook-fill-b.png'
        : 'assets/facebook-fill.png';
    return `<img src="${fallbackPath}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
  }
  return `<img src="${base64}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
};

const getYoutubeIconImg = (
  variant: SignatureVariant = SignatureVariant.Classic
): string => {
  const iconPath =
    variant === SignatureVariant.Classic
      ? YOUTUBE_ICON_PATH_B
      : YOUTUBE_ICON_PATH;
  let base64 = socialIconBase64Cache.get(iconPath);
  if (!base64) {
    const fallbackPath =
      variant === SignatureVariant.Classic
        ? 'assets/youtube-fill-b.png'
        : 'assets/youtube-fill.png';
    return `<img src="${fallbackPath}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
  }
  return `<img src="${base64}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
};

const getLinkedInIconImg = (
  variant: SignatureVariant = SignatureVariant.Classic
): string => {
  const iconPath =
    variant === SignatureVariant.Classic
      ? LINKEDIN_ICON_PATH_B
      : LINKEDIN_ICON_PATH;
  let base64 = socialIconBase64Cache.get(iconPath);
  if (!base64) {
    const fallbackPath =
      variant === SignatureVariant.Classic
        ? 'assets/linkedin-fill-b.png'
        : 'assets/linkedin-fill.png';
    return `<img src="${fallbackPath}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
  }
  return `<img src="${base64}" alt="icon" width="24" height="24" style="display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;" />`;
};

// Inverita social media links (hardcoded - not editable)
const INVERITA_FACEBOOK_URL = 'https://www.facebook.com/inverita.official';
const INVERITA_YOUTUBE_URL = 'https://www.youtube.com/@inverita';
const INVERITA_LINKEDIN_SOCIAL_URL =
  'https://www.linkedin.com/company/inveritaofficial';

// Inverita website (hardcoded - not editable)
const INVERITA_WEBSITE_URL = 'https://inveritasoft.com';
const INVERITA_WEBSITE_TEXT = 'inveritasoft.com';

// Chrome Storage key
const STORAGE_KEY = 'signatureState';

// Helper to check if Chrome Storage API is available
const isChromeExtension = (): boolean => {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.storage !== 'undefined' &&
    typeof chrome.storage.local !== 'undefined'
  );
};

// Helper to load state from Chrome Storage
const loadFromStorage = async (): Promise<Partial<SignatureState> | null> => {
  if (!isChromeExtension()) {
    return null;
  }

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  } catch (error) {
    console.error('Failed to load from Chrome Storage:', error);
    return null;
  }
};

// Helper to save state to Chrome Storage
const saveToStorage = async (state: SignatureState): Promise<void> => {
  if (!isChromeExtension()) {
    return;
  }

  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
  } catch (error) {
    console.error('Failed to save to Chrome Storage:', error);
  }
};

export const SignatureStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withHooks({
    onInit: async (store) => {
      // Pre-load social icons to base64 cache
      await preloadSocialIcons();

      // Load state from Chrome Storage on initialization
      const savedState = await loadFromStorage();
      let isInitializing = true;

      if (savedState) {
        // Remove hardcoded social links and website from saved state to prevent overriding them
        const {
          facebookUrl,
          youtubeUrl,
          linkedInSocialUrl,
          websiteUrl,
          websiteText,
          ...stateToLoad
        } = savedState;
        patchState(store, stateToLoad);
      }

      // Mark initialization as complete
      isInitializing = false;

      // Watch for state changes and save to Chrome Storage
      // Only save after initialization is complete to avoid saving during load
      effect(() => {
        // Skip saving during initialization
        if (isInitializing) {
          return;
        }

        const currentState = {
          name: store.name(),
          title: store.title(),
          linkedInUrl: store.linkedInUrl(),
          linkedInText: store.linkedInText(),
          websiteUrl: INVERITA_WEBSITE_URL,
          websiteText: INVERITA_WEBSITE_TEXT,
          facebookUrl: INVERITA_FACEBOOK_URL,
          youtubeUrl: INVERITA_YOUTUBE_URL,
          linkedInSocialUrl: INVERITA_LINKEDIN_SOCIAL_URL,
          imageUrl: store.imageUrl(),
          baseUrl: store.baseUrl(),
          variant: store.variant(),
        };
        saveToStorage(currentState);
      });
    },
  }),
  withComputed((store) => ({
    // Hardcoded Inverita social links (always return these values, not editable)
    facebookUrl: computed(() => INVERITA_FACEBOOK_URL),
    youtubeUrl: computed(() => INVERITA_YOUTUBE_URL),
    linkedInSocialUrl: computed(() => INVERITA_LINKEDIN_SOCIAL_URL),

    // Hardcoded Inverita website (always return these values, not editable)
    websiteUrl: computed(() => INVERITA_WEBSITE_URL),
    websiteText: computed(() => INVERITA_WEBSITE_TEXT),

    // Computed state signal that combines all individual signals
    state: computed(() => ({
      name: store.name(),
      title: store.title(),
      linkedInUrl: store.linkedInUrl(),
      linkedInText: store.linkedInText(),
      websiteUrl: INVERITA_WEBSITE_URL,
      websiteText: INVERITA_WEBSITE_TEXT,
      facebookUrl: INVERITA_FACEBOOK_URL,
      youtubeUrl: INVERITA_YOUTUBE_URL,
      linkedInSocialUrl: INVERITA_LINKEDIN_SOCIAL_URL,
      imageUrl: store.imageUrl(),
      baseUrl: store.baseUrl(),
      variant: store.variant(),
    })),
  })),
  withMethods((store) => {
    // Cache for base64 images
    const base64Cache = new Map<string, string>();

    // Promise that resolves when social icons are loaded
    let socialIconsLoadPromise: Promise<void> | null = null;

    // Ensure social icons are loaded (can be called multiple times safely)
    const ensureSocialIconsLoaded = async (): Promise<void> => {
      if (socialIconsLoadPromise) {
        return socialIconsLoadPromise;
      }
      if (socialIconsLoaded) {
        return Promise.resolve();
      }
      socialIconsLoadPromise = preloadSocialIcons();
      return socialIconsLoadPromise;
    };

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
          // Check if we're in a Chrome Extension context
          if (isChromeExtension() && chrome.runtime && chrome.runtime.getURL) {
            // Use chrome.runtime.getURL for extension resources
            const basePath = imagePath.startsWith('/')
              ? imagePath.substring(1)
              : imagePath;
            resolvedPath = chrome.runtime.getURL(basePath);
          } else {
            // For web context, resolve to current origin
            const basePath = imagePath.startsWith('/')
              ? imagePath
              : `/${imagePath}`;
            resolvedPath = `${window.location.origin}${basePath}`;
          }
        } else if (
          !imagePath.startsWith('http://') &&
          !imagePath.startsWith('https://') &&
          !imagePath.startsWith('data:')
        ) {
          // For other relative paths
          if (isChromeExtension() && chrome.runtime && chrome.runtime.getURL) {
            // Use chrome.runtime.getURL for extension resources
            const basePath = imagePath.startsWith('/')
              ? imagePath.substring(1)
              : imagePath;
            resolvedPath = chrome.runtime.getURL(basePath);
          } else {
            // For web context, resolve to current origin
            const basePath = imagePath.startsWith('/')
              ? imagePath
              : `/${imagePath}`;
            resolvedPath = `${window.location.origin}${basePath}`;
          }
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
        // No-op: Website URL is hardcoded to Inverita's website
      },

      updateWebsiteText(text: string): void {
        // No-op: Website text is hardcoded to Inverita's website
      },

      updateFacebookUrl(url: string): void {
        // No-op: Facebook URL is hardcoded to Inverita's page
      },

      updateYoutubeUrl(url: string): void {
        // No-op: YouTube URL is hardcoded to Inverita's page
      },

      updateLinkedInSocialUrl(url: string): void {
        // No-op: LinkedIn social URL is hardcoded to Inverita's page
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
        // Also filter out hardcoded social links that should not be editable
        const normalizedUpdates: Partial<SignatureState> = {};
        Object.keys(updates).forEach((key) => {
          const typedKey = key as keyof SignatureState;
          // Skip hardcoded social links and website
          if (
            typedKey === 'facebookUrl' ||
            typedKey === 'youtubeUrl' ||
            typedKey === 'linkedInSocialUrl' ||
            typedKey === 'websiteUrl' ||
            typedKey === 'websiteText'
          ) {
            return;
          }
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
        // Clear Chrome Storage on reset
        if (isChromeExtension()) {
          chrome.storage.local.remove(STORAGE_KEY).catch((error) => {
            console.error('Failed to clear Chrome Storage:', error);
          });
        }
      },

      /**
       * Converts SVG string to base64 data URL
       * @param svgString - SVG string
       * @returns Base64 data URL
       */
      svgToBase64(svgString: string): string {
        // Remove any existing XML declaration and clean up the SVG
        const cleanedSvg = svgString.replace(/<\?xml[^>]*\?>/gi, '').trim();

        // Encode SVG to base64
        const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
        return `data:image/svg+xml;base64,${base64}`;
      },

      /**
       * Converts all image src attributes and inline SVG to base64
       * @param html - HTML string with image src attributes and inline SVG
       * @returns Promise that resolves to HTML with base64 image src
       */
      async convertImagesToBase64(html: string): Promise<string> {
        let result = html;

        // First, convert inline SVG elements to base64 data URLs (email clients strip SVG)
        // Use a more flexible regex that handles whitespace variations
        const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/gi;
        let svgMatch;
        const svgReplacements: Array<{
          original: string;
          replacement: string;
        }> = [];

        // Reset regex lastIndex to ensure we match all occurrences
        svgRegex.lastIndex = 0;
        let svgCount = 0;
        while ((svgMatch = svgRegex.exec(html)) !== null) {
          svgCount++;
          const svgString = svgMatch[0];
          // Skip if already in an img tag with data URL
          if (!svgString.includes('data:image/')) {
            // Convert SVG to base64 data URL
            const cleanedSvg = svgString.replace(/<\?xml[^>]*\?>/gi, '').trim();

            try {
              const base64 = btoa(unescape(encodeURIComponent(cleanedSvg)));
              const base64DataUrl = `data:image/svg+xml;base64,${base64}`;

              // Verify base64 conversion worked
              if (
                !base64DataUrl ||
                base64DataUrl.length < 50 ||
                !base64DataUrl.startsWith('data:image/svg+xml;base64,')
              ) {
                console.error(
                  'Invalid base64 data URL generated for SVG. Length:',
                  base64DataUrl?.length,
                  'Starts with data:',
                  base64DataUrl?.startsWith('data:')
                );
                continue;
              }

              // Extract color from SVG fill attribute if present
              const fillMatch = svgString.match(/fill=["']([^"']+)["']/i);
              const svgColor = fillMatch ? fillMatch[1] : 'currentColor';
              const iconStyle =
                'display: block; width: 24px; height: 24px; border: 0; outline: none; text-decoration: none;';

              // Ensure src attribute is properly quoted and base64DataUrl is valid
              if (!base64DataUrl || base64DataUrl.trim() === '') {
                console.error('base64DataUrl is empty, skipping replacement');
                continue;
              }

              const imgTag = `<img src="${base64DataUrl}" alt="icon" width="24" height="24" style="${iconStyle}" />`;

              // Verify the img tag was created correctly
              if (
                !imgTag.includes('src="') ||
                !imgTag.includes(base64DataUrl)
              ) {
                console.error(
                  'Failed to create img tag with src. imgTag:',
                  imgTag.substring(0, 100)
                );
                continue;
              }

              svgReplacements.push({
                original: svgString,
                replacement: imgTag,
              });
            } catch (error) {
              console.error(
                'Failed to convert SVG to base64:',
                error,
                svgString.substring(0, 100)
              );
            }
          }
        }

        // Replace inline SVG with img tags using base64 data URLs
        // Process in reverse order to maintain correct indices (to avoid index shifting)
        for (let i = svgReplacements.length - 1; i >= 0; i--) {
          const { original, replacement } = svgReplacements[i];

          // Try exact match first (most reliable)
          let index = result.indexOf(original);
          if (index !== -1) {
            result =
              result.substring(0, index) +
              replacement +
              result.substring(index + original.length);
            continue;
          }

          // Fallback: use regex with flexible whitespace matching
          // Normalize whitespace in both strings for comparison
          const normalizedOriginal = original.replace(/\s+/g, ' ').trim();
          // Create a flexible regex pattern that matches the SVG with variable whitespace
          const svgPattern = normalizedOriginal
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
            .replace(/\s+/g, '\\s+'); // Make whitespace flexible

          try {
            const regex = new RegExp(svgPattern, 'gi');
            const match = result.match(regex);
            if (match && match.length > 0) {
              // Replace first match (should be the only one)
              result = result.replace(regex, replacement);
            }
          } catch (regexError) {
            console.error(
              'Regex replacement failed:',
              regexError,
              'Pattern:',
              svgPattern.substring(0, 80)
            );
          }
        }

        // Verify all img tags have src attributes (safety check)
        const imgTagRegex = /<img[^>]*>/gi;
        const allImgTags: string[] = [];
        let imgTagMatch;
        imgTagRegex.lastIndex = 0;
        while ((imgTagMatch = imgTagRegex.exec(result)) !== null) {
          allImgTags.push(imgTagMatch[0]);
        }

        // Check for img tags without src and try to fix them if they're our icon tags
        const imgTagsWithoutSrc = allImgTags.filter(
          (imgTag) => !imgTag.includes('src=')
        );
        if (imgTagsWithoutSrc.length > 0) {
          console.error(
            `Found ${imgTagsWithoutSrc.length} img tag(s) without src attribute:`,
            imgTagsWithoutSrc
          );

          // Try to fix icon img tags that might have been created incorrectly
          imgTagsWithoutSrc.forEach((brokenImgTag) => {
            if (brokenImgTag.includes('alt="icon"')) {
              // This shouldn't happen if our code is working correctly
            }
          });
        }

        // Then convert regular image src attributes to base64
        const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const imageUrls = new Set<string>();
        let match;

        while ((match = imgSrcRegex.exec(result)) !== null) {
          const imageUrl = match[1];
          // Skip if already base64 data URL
          if (!imageUrl.startsWith('data:image/')) {
            imageUrls.add(imageUrl);
          }
        }

        // If all images are already base64, return as-is
        if (imageUrls.size === 0) {
          return result;
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
      async generateEmailSignature(
        baseUrlOverride: string = '',
        stateOverride?: SignatureState
      ): Promise<string> {
        // Ensure social icons are loaded before generating signature
        await ensureSocialIconsLoaded();
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

        // Use pre-converted base64 PNG img tags for social icons
        // Icons are pre-loaded to base64 cache on store initialization
        // Classic variant uses -b versions, others use regular versions
        const facebookIconImg = getFacebookIconImg(variant);
        const youtubeIconImg = getYoutubeIconImg(variant);
        const linkedInIconImg = getLinkedInIconImg(variant);

        // Route to appropriate variant template
        switch (variant) {
          case SignatureVariant.Dark:
            return this.generateDarkVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.Gradient:
            return this.generateGradientVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.Vertical:
            return this.generateVerticalVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.Quadrant:
            return this.generateQuadrantVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.HorizontalLogo:
            return this.generateHorizontalLogoVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.GradientBlue:
            return this.generateGradientBlueVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.HorizontalSimple:
            return this.generateHorizontalSimpleVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          case SignatureVariant.VerticalSimple:
            return this.generateVerticalSimpleVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
          default:
            return this.generateClassicVariant(
              state,
              baseUrlOverride,
              portraitUrl,
              logoUrlValue,
              facebookIconImg,
              youtubeIconImg,
              linkedInIconImg
            );
        }
      },

      generateClassicVariant(
        state: SignatureState,
        baseUrlOverride: string,
        portraitUrl: string,
        logoUrlValue: string,
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
                <td style="padding: 0; background: linear-gradient(300deg, #FAF6AF -91.29%, #7AD0CB -15.73%, #006BE5 75.91%); height: 60px; text-align: center; vertical-align: middle;">
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
          </td>
          
          <!-- Right Column: Contact Information -->
          <td valign="top" style="background-color: #ffffff; padding: 0; vertical-align: top;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fbfbfb;">
              <!-- Contact Info Container -->
              <tr>
                <td style="background-color: #fbf9ff; padding: 20px; width: 100%;">
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
                      <td style="padding: 0; height: 36px; line-height: 4px; font-size: 4px;">&nbsp;</td>
                    </tr>
                    <!-- LinkedIn Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${linkedInUrl}" style="display: block; text-decoration: none; color: inherit; background-color: #fbf9ff; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #6b7280;">
                            ${linkedInText}
                          </p>
                        </a>
                      </td>
                    </tr>
                    <!-- Website Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #000000; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; background-color: #fbf9ff; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #000000;">
                            ${websiteText}
                          </p>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Social Media Section -->
              <tr>
                <td style="background-color: #e2e1e6; padding: 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="padding: 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                          <tr>
                            <!-- Facebook Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${facebookIconImg}
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${youtubeIconImg}
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none;" />
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
                      <td style="padding: 0; height: 36px; line-height: 4px; font-size: 4px;">&nbsp;</td>
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
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${facebookIconImg}
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${youtubeIconImg}
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
                      <td style="padding: 0; height: 36px; line-height: 4px; font-size: 4px;">&nbsp;</td>
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
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${facebookIconImg}
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${youtubeIconImg}
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
              ${facebookIconImg}
            </a>
          </td>
          <td style="padding: 0 14px 0 0;">
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              ${youtubeIconImg}
            </a>
          </td>
          <td style="padding: 0;">
            <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
                      <td style="padding: 0; height: 36px; line-height: 4px; font-size: 4px;">&nbsp;</td>
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
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${facebookIconImg}
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${youtubeIconImg}
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
                          ${facebookIconImg}
                        </a>
                      </td>
                      <td style="padding: 0 14px 0 0;">
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                          ${youtubeIconImg}
                        </a>
                      </td>
                      <td style="padding: 0;">
                        <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                          ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
          <td valign="top" width="180" style="width: 180px; padding: 0; vertical-align: top; background: #fff;">
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
                  <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0);" />
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
                      <td style="padding: 0; height: 36px; line-height: 4px; font-size: 4px;">&nbsp;</td>
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
                    <!-- Website Link -->
                    <tr>
                      <td style="padding: 0;">
                        <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: underline; color: #FFFFFF; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; background-color: transparent; height: 24px; line-height: 24px;">
                          <p style="margin: 0; padding: 0; font-family: 'Montserrat', Arial, sans-serif; font-size: 15px; font-weight: 600; line-height: 24px; color: #FFFFFF;">
                            ${websiteText}
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
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${facebookIconImg}
                              </a>
                            </td>
                            <!-- YouTube Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${youtubeIconImg}
                              </a>
                            </td>
                            <!-- LinkedIn Icon -->
                            <td style="padding: 0; width: 60px; height: 60px; text-align: center; vertical-align: middle;">
                              <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
                                ${linkedInIconImg}
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
            <img src="${logoUrlValue}" alt="Inverita logo" width="140" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
        facebookIconImg: string,
        youtubeIconImg: string,
        linkedInIconImg: string
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
            <img src="${logoUrlValue}" alt="Inverita logo" width="180" height="35" style="display: block; width: auto; height: 35px; margin: 0 auto; border: 0; outline: none; text-decoration: none; filter: brightness(0) invert(1);" />
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
              ${youtubeIconImg}
            </a>
          </td>
          <td style="padding: 0 14px 0 0;">
            <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              ${facebookIconImg}
            </a>
          </td>
          <td style="padding: 0;">
            <a href="${linkedInSocialUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
              ${linkedInIconImg}
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
