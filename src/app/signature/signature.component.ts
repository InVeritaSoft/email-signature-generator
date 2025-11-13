import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SignatureStore } from '../store/signature.store';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css',
})
export class SignatureComponent implements OnInit {
  // Image assets (hardcoded - not editable)
  readonly logoUrl = 'assets/516f9476ae82f86dc9aed7edb53d662b1027a057.svg';
  readonly facebookIconUrl =
    'assets/86fe2a2a805b38a53a570fffbfcedff5bee14c6e.svg';
  readonly youtubeIconUrl =
    'assets/e954b2b256844b45a4312866e2427080e4f4680e.svg';
  readonly linkedInIconUrl =
    'assets/252ab1f841d7b12fa4ab683d55d5059552029ff1.svg';

  // Inject store using NgRx pattern
  readonly store = inject(SignatureStore);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  signatureForm: FormGroup;
  readonly copySuccess = signal(false);
  readonly baseUrl = signal('');

  constructor() {
    // URL validator that allows empty strings or valid URLs (http/https or relative paths)
    const urlValidator = Validators.pattern(
      /^(https?:\/\/.+|\/.*|assets\/.*|$)/
    );

    // Initialize form with store values
    const state = this.store.state();
    this.signatureForm = this.fb.group({
      name: [state.name, [Validators.required]],
      title: [state.title, [Validators.required]],
      linkedInUrl: [state.linkedInUrl, [urlValidator]],
      linkedInText: [state.linkedInText],
      websiteUrl: [state.websiteUrl, [urlValidator]],
      websiteText: [state.websiteText],
      facebookUrl: [state.facebookUrl, [urlValidator]],
      youtubeUrl: [state.youtubeUrl, [urlValidator]],
      linkedInSocialUrl: [state.linkedInSocialUrl, [urlValidator]],
      imageUrl: [state.imageUrl, [urlValidator]],
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
      const name = this.store.name();
      const title = this.store.title();
      const linkedInUrl = this.store.linkedInUrl();
      const linkedInText = this.store.linkedInText();
      const websiteUrl = this.store.websiteUrl();
      const websiteText = this.store.websiteText();
      const facebookUrl = this.store.facebookUrl();
      const youtubeUrl = this.store.youtubeUrl();
      const linkedInSocialUrl = this.store.linkedInSocialUrl();
      const imageUrl = this.store.imageUrl();

      // Only update if form values differ to avoid infinite loops
      const formValue = this.signatureForm.value;
      const hasChanges =
        formValue.name !== name ||
        formValue.title !== title ||
        formValue.linkedInUrl !== linkedInUrl ||
        formValue.linkedInText !== linkedInText ||
        formValue.websiteUrl !== websiteUrl ||
        formValue.websiteText !== websiteText ||
        formValue.facebookUrl !== facebookUrl ||
        formValue.youtubeUrl !== youtubeUrl ||
        formValue.linkedInSocialUrl !== linkedInSocialUrl ||
        formValue.imageUrl !== imageUrl;

      if (hasChanges) {
        const state = this.store.state();
        this.signatureForm.patchValue(state, { emitEvent: false });
      }
    });

    // Sync baseUrl changes to store
    effect(() => {
      this.store.updateBaseUrl(this.baseUrl());
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
    // Track all individual store signals to ensure reactivity
    const name = this.store.name();
    const title = this.store.title();
    const linkedInUrl = this.store.linkedInUrl();
    const linkedInText = this.store.linkedInText();
    const websiteUrl = this.store.websiteUrl();
    const websiteText = this.store.websiteText();
    const facebookUrl = this.store.facebookUrl();
    const youtubeUrl = this.store.youtubeUrl();
    const linkedInSocialUrl = this.store.linkedInSocialUrl();
    const imageUrl = this.store.imageUrl();
    const baseUrlValue = this.baseUrl();

    // Get current state and pass to generation method
    const state = this.store.state();
    const html = this.store.generateEmailHtml(baseUrlValue, state);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly emailSignatureString = computed(() => {
    // Track all individual store signals to ensure reactivity
    this.store.name();
    this.store.title();
    this.store.linkedInUrl();
    this.store.linkedInText();
    this.store.websiteUrl();
    this.store.websiteText();
    this.store.facebookUrl();
    this.store.youtubeUrl();
    this.store.linkedInSocialUrl();
    this.store.imageUrl();
    const baseUrlValue = this.baseUrl();

    // Get current state and pass to generation method
    const state = this.store.state();
    return this.store.generateEmailSignature(baseUrlValue, state);
  });

  readonly emailHtmlString = computed(() => {
    // Track all individual store signals to ensure reactivity
    this.store.name();
    this.store.title();
    this.store.linkedInUrl();
    this.store.linkedInText();
    this.store.websiteUrl();
    this.store.websiteText();
    this.store.facebookUrl();
    this.store.youtubeUrl();
    this.store.linkedInSocialUrl();
    this.store.imageUrl();
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
  generateEmailSignature(baseUrl: string = ''): string {
    return this.store.generateEmailSignature(baseUrl);
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
    try {
      const html = this.generateEmailSignature();
      await navigator.clipboard.writeText(html);
      this.copySuccess.set(true);
      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.generateEmailSignature();
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
}
