import { Component } from '@angular/core';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css'
})
export class SignatureComponent {
  // Image assets
  readonly imageUrl = 'assets/f629c4c2df25111d7773a91610d6528d1a8cb5bb.png';
  readonly logoUrl = 'assets/516f9476ae82f86dc9aed7edb53d662b1027a057.svg';
  readonly facebookIconUrl = 'assets/86fe2a2a805b38a53a570fffbfcedff5bee14c6e.svg';
  readonly youtubeIconUrl = 'assets/e954b2b256844b45a4312866e2427080e4f4680e.svg';
  readonly linkedInIconUrl = 'assets/252ab1f841d7b12fa4ab683d55d5059552029ff1.svg';

  // Contact information
  readonly name = 'Zoryan Hudziy';
  readonly title = 'CEO, Co-founder Inverita';
  readonly linkedInText = 'Zoryan on LinkedIn';
  readonly linkedInUrl = 'https://www.linkedin.com/in/zoryan-hudziy';
  readonly websiteUrl = 'https://inveritasoft.com';
  readonly websiteText = 'inveritasoft.com';
  
  // Social media links
  readonly facebookUrl = 'https://www.facebook.com/inveritasoft';
  readonly youtubeUrl = 'https://www.youtube.com/@inveritasoft';
  readonly linkedInSocialUrl = 'https://www.linkedin.com/company/inveritasoft';
}

