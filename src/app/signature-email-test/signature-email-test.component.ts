import {
  Component,
  OnInit,
  inject,
  computed,
  effect,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SignatureStore } from '../store/signature.store';

@Component({
  selector: 'app-signature-email-test',
  standalone: true,
  imports: [],
  templateUrl: './signature-email-test.component.html',
  styleUrl: './signature-email-test.component.css',
})
export class SignatureEmailTestComponent implements OnInit {
  // Inject dependencies using NgRx pattern
  readonly store = inject(SignatureStore);
  private readonly sanitizer = inject(DomSanitizer);

  readonly baseUrl = signal('');

  // Computed signals for email HTML - track all individual signals for proper reactivity
  readonly emailHtml = computed(() => {
    // Track all individual store signals to ensure reactivity
    // This ensures any change to any field triggers recomputation
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

  readonly emailSignature = computed(() => {
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
    const signature = this.store.generateEmailSignature(baseUrlValue, state);
    return this.sanitizer.bypassSecurityTrustHtml(signature);
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

  constructor() {
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

  async copyToClipboard(content: string): Promise<void> {
    try {
      // Convert all images to base64 for email compatibility
      const contentWithBase64 = await this.store.convertImagesToBase64(content);
      await navigator.clipboard.writeText(contentWithBase64);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: try copying without base64 conversion
      try {
        await navigator.clipboard.writeText(content);
        alert('Copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Failed to copy to clipboard');
      }
    }
  }
}
