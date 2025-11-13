import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignatureComponent } from './signature.component';

describe('SignatureComponent', () => {
  let component: SignatureComponent;
  let fixture: ComponentFixture<SignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameElement = compiled.querySelector('[data-name="name"]');
    expect(nameElement?.textContent?.trim()).toBe('Zoryan Hudziy');
  });

  it('should display the title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('[data-name="title"]');
    expect(titleElement?.textContent?.trim()).toContain('CEO, Co-founder Inverita');
  });

  it('should display the LinkedIn link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkedInLink = compiled.querySelector('[data-name="linkedin-link"]');
    expect(linkedInLink?.textContent?.trim()).toBe('Zoryan on LinkedIn');
  });

  it('should display the website link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const websiteLink = compiled.querySelector('[data-name="website-link"]');
    expect(websiteLink?.textContent?.trim()).toBe('inveritasoft.com');
  });

  it('should have social media icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const socialIcons = compiled.querySelectorAll('[data-name="social-icon-link"]');
    expect(socialIcons.length).toBeGreaterThan(0);
  });

  it('should display the portrait image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const portraitImage = compiled.querySelector('[data-name="portrait-image"]');
    expect(portraitImage).toBeTruthy();
  });

  it('should display the company logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logo = compiled.querySelector('[data-name="company-logo"]');
    expect(logo).toBeTruthy();
  });
});

