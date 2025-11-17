import {
  Component,
  OnInit,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SignatureStore, SignatureVariant } from '../store/signature.store';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css',
})
export class SignatureComponent implements OnInit {
  // Image assets (hardcoded - not editable)
  readonly logoUrl = 'assets/logo.png';

  // Inject store using NgRx pattern
  readonly store = inject(SignatureStore);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  signatureForm: FormGroup;
  readonly copySuccess = signal(false);
  readonly emailPreviewCopySuccess = signal(false);
  readonly baseUrl = signal('');
  readonly emailHtmlWithBase64 = signal<SafeHtml | null>(null);
  readonly formSubmitted = signal(false);
  private lastSignatureHash = signal<string>('');
  private isConverting = false;

  constructor() {
    // URL validator that allows empty strings, valid URLs (http/https or relative paths), or base64 data URLs
    const urlValidator = Validators.pattern(
      /^(https?:\/\/.+|\/.*|assets\/.*|data:image\/.+;base64,.+|$)/
    );

    // Initialize form with store values
    // Note: Social links and website (facebookUrl, youtubeUrl, linkedInSocialUrl, websiteUrl, websiteText) are hardcoded and not editable
    const state = this.store.state();
    this.signatureForm = this.fb.group({
      name: [state.name, [Validators.required]],
      title: [state.title, [Validators.required]],
      linkedInUrl: [state.linkedInUrl, [urlValidator]],
      linkedInText: [state.linkedInText],
      imageUrl: [state.imageUrl, [urlValidator]],
      variant: [state.variant],
    });

    // Sync form values to store on change
    // Use debounceTime(0) to ensure all changes including clearing fields are captured
    this.signatureForm.valueChanges.subscribe((values) => {
      // Normalize empty strings to ensure updates are triggered
      const normalizedValues = Object.keys(values).reduce((acc, key) => {
        acc[key] =
          values[key] === null || values[key] === undefined ? '' : values[key];
        return acc;
      }, {} as any);
      this.store.updateState(normalizedValues);
    });

    // Sync form from store when store changes externally (bidirectional sync)
    // Use effect to track store state changes and update form
    effect(() => {
      // Track all individual store signals to ensure reactivity
      // Note: Social links and website are hardcoded and not in the form
      const name = this.store.name();
      const title = this.store.title();
      const linkedInUrl = this.store.linkedInUrl();
      const linkedInText = this.store.linkedInText();
      const imageUrl = this.store.imageUrl();
      const variant = this.store.variant();

      // Only update if form values differ to avoid infinite loops
      const formValue = this.signatureForm.value;
      const hasChanges =
        formValue.name !== name ||
        formValue.title !== title ||
        formValue.linkedInUrl !== linkedInUrl ||
        formValue.linkedInText !== linkedInText ||
        formValue.imageUrl !== imageUrl ||
        formValue.variant !== variant;

      if (hasChanges) {
        const state = this.store.state();
        this.signatureForm.patchValue(state, { emitEvent: false });
      }
    });

    // Sync baseUrl changes to store
    effect(() => {
      this.store.updateBaseUrl(this.baseUrl());
    });

    // Automatically update LinkedIn text based on name
    effect(() => {
      const name = this.store.name();
      if (name && name.trim()) {
        // Extract first name (everything before the first space)
        const firstName = name.trim().split(/\s+/)[0];
        const autoLinkedInText = `${firstName} on LinkedIn`;
        // Only update if different to avoid unnecessary updates
        if (this.store.linkedInText() !== autoLinkedInText) {
          this.store.updateLinkedInText(autoLinkedInText);
          // Also update form if it exists
          if (this.signatureForm.get('linkedInText')) {
            this.signatureForm.patchValue(
              { linkedInText: autoLinkedInText },
              { emitEvent: false }
            );
          }
        }
      }
    });

    // Effect to convert images to base64 for email preview
    effect(() => {
      // Track all individual store signals to ensure reactivity
      // Note: Social links and website are hardcoded and always available
      const name = this.store.name();
      const title = this.store.title();
      const linkedInUrl = this.store.linkedInUrl();
      const linkedInText = this.store.linkedInText();
      const imageUrl = this.store.imageUrl();
      const variant = this.store.variant();
      const baseUrlValue = this.baseUrl();

      // Generate signature (now async - ensures icons are loaded)
      this.store
        .generateEmailSignature(baseUrlValue)
        .then((signature) => {
          // Create a hash of the signature to detect actual changes
          // Simple hash function for string comparison
          let hash = 0;
          for (let i = 0; i < signature.length; i++) {
            const char = signature.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
          }
          const signatureHash = hash.toString();

          // Only convert if signature actually changed and we're not already converting
          if (
            this.lastSignatureHash() !== signatureHash &&
            !this.isConverting
          ) {
            this.lastSignatureHash.set(signatureHash);
            this.isConverting = true;

            // Convert images to base64 for email preview
            this.store
              .convertImagesToBase64(signature)
              .then((htmlWithBase64) => {
                this.emailHtmlWithBase64.set(
                  this.sanitizer.bypassSecurityTrustHtml(htmlWithBase64)
                );
                this.isConverting = false;
              })
              .catch((error) => {
                console.error('Failed to convert images to base64:', error);
                // Fallback to original signature
                this.emailHtmlWithBase64.set(
                  this.sanitizer.bypassSecurityTrustHtml(signature)
                );
                this.isConverting = false;
              });
          }
        })
        .catch((error) => {
          console.error('Failed to generate signature:', error);
        });
    });
  }

  ngOnInit(): void {
    // Initialize baseUrl from store
    this.baseUrl.set(this.store.baseUrl());
  }

  onBaseUrlChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.baseUrl.set(input.value);
  }

  // Computed signals for email HTML - track all individual signals for proper reactivity
  readonly emailHtml = computed(() => {
    // Track the base64 HTML signal to ensure reactivity
    const base64Html = this.emailHtmlWithBase64();

    // If base64 version is available, return it; otherwise return a placeholder
    if (base64Html) {
      return base64Html;
    }

    // Fallback: return null, async signature generation handled by effect
    return null;
  });

  readonly emailSignatureString = computed(() => {
    // Track all individual store signals to ensure reactivity
    // Note: Social links and website are hardcoded and always available
    this.store.name();
    this.store.title();
    this.store.linkedInUrl();
    this.store.linkedInText();
    this.store.websiteUrl(); // Hardcoded Inverita website
    this.store.websiteText(); // Hardcoded Inverita website text
    this.store.facebookUrl(); // Hardcoded Inverita link
    this.store.youtubeUrl(); // Hardcoded Inverita link
    this.store.linkedInSocialUrl(); // Hardcoded Inverita link
    this.store.imageUrl();
    this.store.variant();
    this.baseUrl();

    // Signature generation is now async - return empty string
    // Actual signature is handled by the effect and stored in emailHtmlWithBase64
    return '';
  });

  readonly emailHtmlString = computed(() => {
    // Track all individual store signals to ensure reactivity
    // Note: Social links and website are hardcoded and always available
    this.store.name();
    this.store.title();
    this.store.linkedInUrl();
    this.store.linkedInText();
    this.store.websiteUrl(); // Hardcoded Inverita website
    this.store.websiteText(); // Hardcoded Inverita website text
    this.store.facebookUrl(); // Hardcoded Inverita link
    this.store.youtubeUrl(); // Hardcoded Inverita link
    this.store.linkedInSocialUrl(); // Hardcoded Inverita link
    this.store.imageUrl();
    this.store.variant();
    const baseUrlValue = this.baseUrl();

    // Get current state and pass to generation method
    const state = this.store.state();
    return this.store.generateEmailHtml(baseUrlValue, state);
  });

  /**
   * Syncs current form values to store - called on input events to ensure immediate updates
   * @param event - Input event to get the current value directly from the input element
   */
  syncFormToStore(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldName = input.getAttribute('formControlName');

    if (fieldName) {
      // Read value directly from input element (always current, even when cleared)
      // This ensures we get the actual current value, not the form control's value
      // which might not have updated yet
      let value = input.value;

      // Normalize: convert null/undefined to empty string
      if (value === null || value === undefined) {
        value = '';
      } else {
        value = String(value);
      }

      // Always update the store - patchState will handle creating new object reference
      // This ensures signals are triggered even when value changes to/from empty string
      const updates: any = { [fieldName]: value };
      this.store.updateState(updates);
    }
  }

  /**
   * Generates email-compatible HTML signature (body content only, for direct insertion)
   * @param baseUrl - Base URL for images (e.g., 'https://yourdomain.com' or 'https://cdn.yourdomain.com')
   * @returns HTML string ready for email clients (just the signature, no html/body tags)
   */
  async generateEmailSignature(baseUrl: string = ''): Promise<string> {
    return await this.store.generateEmailSignature(baseUrl);
  }

  /**
   * Generates email-compatible HTML signature (full document)
   * @param baseUrl - Base URL for images (e.g., 'https://yourdomain.com' or 'https://cdn.yourdomain.com')
   * @returns Complete HTML document ready for email clients
   */
  generateEmailHtml(baseUrl: string = ''): string {
    return this.store.generateEmailHtml(baseUrl);
  }

  /**
   * Copies the generated HTML signature to clipboard
   */
  async copyToClipboard(): Promise<void> {
    // Mark form as submitted to show validation errors
    this.formSubmitted.set(true);

    // Mark all form controls as touched to trigger validation display
    Object.keys(this.signatureForm.controls).forEach((key) => {
      this.signatureForm.get(key)?.markAsTouched();
    });

    // If form is invalid, don't proceed with copy
    if (this.signatureForm.invalid) {
      return;
    }

    try {
      // Generate signature and convert all images to base64 for email compatibility
      // Note: Social icons are now inline SVG, so they don't need base64 conversion
      const html = await this.generateEmailSignature();
      const htmlWithBase64 = await this.store.convertImagesToBase64(html);

      await navigator.clipboard.writeText(htmlWithBase64);
      this.copySuccess.set(true);
      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      try {
        const html = await this.generateEmailSignature();
        const htmlWithBase64 = await this.store.convertImagesToBase64(html);
        const textArea = document.createElement('textarea');
        textArea.value = htmlWithBase64;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.copySuccess.set(true);
          setTimeout(() => {
            this.copySuccess.set(false);
          }, 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
      } catch (conversionErr) {
        console.error('Failed to convert images to base64:', conversionErr);
        // Final fallback: copy without base64 conversion
        const textArea = document.createElement('textarea');
        const html = await this.generateEmailSignature();
        textArea.value = html;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          this.copySuccess.set(true);
          setTimeout(() => {
            this.copySuccess.set(false);
          }, 2000);
        } catch (finalErr) {
          console.error('Final fallback copy failed:', finalErr);
        }
        document.body.removeChild(textArea);
      }
    }
  }

  /**
   * Copies content to clipboard (for email test section)
   */
  async copyEmailToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  }

  /**
   * Copies the email preview HTML to clipboard (rendered HTML as displayed)
   */
  async copyEmailPreviewToClipboard(): Promise<void> {
    try {
      // Use the generated email signature string and convert all images to base64
      // This ensures all icons and images are embedded and work in email clients
      const html = await this.generateEmailSignature();
      const htmlWithBase64 = await this.store.convertImagesToBase64(html);

      // Copy as HTML to clipboard (preserves formatting)
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlWithBase64], { type: 'text/html' }),
        'text/plain': new Blob([htmlWithBase64], { type: 'text/plain' }),
      });

      await navigator.clipboard.write([clipboardItem]);
      this.emailPreviewCopySuccess.set(true);
      setTimeout(() => {
        this.emailPreviewCopySuccess.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email preview to clipboard:', err);
      // Fallback: try copying as plain text HTML with base64 conversion
      try {
        const html = await this.generateEmailSignature();
        const htmlWithBase64 = await this.store.convertImagesToBase64(html);
        await navigator.clipboard.writeText(htmlWithBase64);
        this.emailPreviewCopySuccess.set(true);
        setTimeout(() => {
          this.emailPreviewCopySuccess.set(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        // Final fallback using execCommand
        try {
          const html = await this.generateEmailSignature();
          const htmlWithBase64 = await this.store.convertImagesToBase64(html);
          const textArea = document.createElement('textarea');
          textArea.value = htmlWithBase64;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            this.emailPreviewCopySuccess.set(true);
            setTimeout(() => {
              this.emailPreviewCopySuccess.set(false);
            }, 2000);
          } catch (execErr) {
            console.error('execCommand copy failed:', execErr);
          }
          document.body.removeChild(textArea);
        } catch (finalErr) {
          console.error('Final fallback failed:', finalErr);
        }
      }
    }
  }

  /**
   * Updates the selected variant
   */
  selectVariant(variant: SignatureVariant): void {
    this.store.updateVariant(variant);
    this.signatureForm.patchValue({ variant }, { emitEvent: false });
  }

  /**
   * Get available variants
   */
  readonly variants: SignatureVariant[] = [
    SignatureVariant.Classic,
    SignatureVariant.Dark,
    SignatureVariant.Gradient,
    SignatureVariant.Vertical,
    SignatureVariant.Quadrant,
    SignatureVariant.HorizontalLogo,
    SignatureVariant.GradientBlue,
    SignatureVariant.HorizontalSimple,
    SignatureVariant.VerticalSimple,
  ];

  /**
   * Get visible variants (only Classic and GradientBlue are shown)
   */
  readonly visibleVariants = computed(() => {
    return this.variants.filter(
      (variant) =>
        variant === SignatureVariant.Classic ||
        variant === SignatureVariant.GradientBlue
    );
  });

  /**
   * Get display name for variant (handles hyphenated names)
   */
  getVariantDisplayName(variant: SignatureVariant): string {
    return variant
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Handles image file upload and converts to base64
   */
  async onImageUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, JPEG, or PNG)');
      input.value = ''; // Reset input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB');
      input.value = ''; // Reset input
      return;
    }

    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      // Update form and store with base64 data URL
      this.signatureForm.patchValue({ imageUrl: base64 }, { emitEvent: false });
      this.store.updateImageUrl(base64);
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      alert('Failed to upload image. Please try again.');
      input.value = ''; // Reset input
    }
  }

  /**
   * Converts a file to base64 data URL
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Clears the uploaded image
   */
  clearImage(): void {
    this.signatureForm.patchValue({ imageUrl: '' }, { emitEvent: false });
    this.store.updateImageUrl('');
    // Reset file input if it exists
    const fileInput = document.getElementById(
      'imageUpload'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
