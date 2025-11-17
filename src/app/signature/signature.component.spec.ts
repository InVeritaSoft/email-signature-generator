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

  it('should initialize form with default values', () => {
    expect(component.signatureForm).toBeTruthy();
    expect(component.signatureForm.get('name')?.value).toBe('John Doe');
    expect(component.signatureForm.get('title')?.value).toBeTruthy(); // Title is now random
    expect(component.signatureForm.get('linkedInUrl')?.value).toBe('https://www.linkedin.com/in/john-doe');
    expect(component.signatureForm.get('linkedInText')?.value).toBe('John on LinkedIn');
    expect(component.signatureForm.get('websiteUrl')?.value).toBe('https://inveritasoft.com');
    expect(component.signatureForm.get('websiteText')?.value).toBe('inveritasoft.com');
  });

  it('should have required validators on name and title', () => {
    const nameControl = component.signatureForm.get('name');
    const titleControl = component.signatureForm.get('title');
    
    expect(nameControl?.hasError('required')).toBeFalsy();
    expect(titleControl?.hasError('required')).toBeFalsy();
    
    nameControl?.setValue('');
    titleControl?.setValue('');
    
    expect(nameControl?.hasError('required')).toBeTruthy();
    expect(titleControl?.hasError('required')).toBeTruthy();
  });

  it('should validate URL fields', () => {
    const linkedInUrlControl = component.signatureForm.get('linkedInUrl');
    
    linkedInUrlControl?.setValue('not-a-url');
    expect(linkedInUrlControl?.hasError('pattern')).toBeTruthy();
    
    linkedInUrlControl?.setValue('https://www.linkedin.com/in/test');
    expect(linkedInUrlControl?.hasError('pattern')).toBeFalsy();
    
    linkedInUrlControl?.setValue('');
    expect(linkedInUrlControl?.hasError('pattern')).toBeFalsy();
    
    linkedInUrlControl?.setValue('assets/image.png');
    expect(linkedInUrlControl?.hasError('pattern')).toBeFalsy();
  });

  it('should display the name from form', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nameElement = compiled.querySelector('[data-name="name"]');
    expect(nameElement?.textContent?.trim()).toBe('John Doe');
  });

  it('should display the title from form', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('[data-name="title"]');
    expect(titleElement?.textContent?.trim()).toBeTruthy(); // Title is now random
  });

  it('should display the LinkedIn link from form', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const linkedInLink = compiled.querySelector('[data-name="linkedin-link"]');
    expect(linkedInLink?.textContent?.trim()).toBe('John on LinkedIn');
  });

  it('should display the website link from form', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const websiteLink = compiled.querySelector('[data-name="website-link"]');
    expect(websiteLink?.textContent?.trim()).toBe('inveritasoft.com');
  });

  it('should have social media icons', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const socialIcons = compiled.querySelectorAll('[data-name="social-icon-link"]');
    expect(socialIcons.length).toBeGreaterThan(0);
  });

  it('should display the portrait image', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const portraitImage = compiled.querySelector('[data-name="portrait-image"]');
    expect(portraitImage).toBeTruthy();
  });

  it('should display the company logo', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const logo = compiled.querySelector('[data-name="company-logo"]');
    expect(logo).toBeTruthy();
  });

  it('should generate email signature using form values', () => {
    component.signatureForm.patchValue({
      name: 'Test User',
      title: 'Test Title',
      linkedInUrl: 'https://www.linkedin.com/in/test',
      linkedInText: 'Test on LinkedIn',
      websiteUrl: 'https://test.com',
      websiteText: 'test.com'
    });
    
    const html = component.generateEmailSignature();
    expect(html).toContain('Test User');
    expect(html).toContain('Test Title');
    expect(html).toContain('https://www.linkedin.com/in/test');
    expect(html).toContain('Test on LinkedIn');
    expect(html).toContain('https://test.com');
    expect(html).toContain('test.com');
  });

  it('should copy HTML to clipboard', async () => {
    const writeTextSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    
    await component.copyToClipboard();
    
    expect(writeTextSpy).toHaveBeenCalled();
    expect(component.copySuccess).toBeTruthy();
  });

  it('should handle clipboard copy failure with fallback', async () => {
    const writeTextSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('Error'));
    const execCommandSpy = spyOn(document, 'execCommand').and.returnValue(true);
    
    await component.copyToClipboard();
    
    expect(writeTextSpy).toHaveBeenCalled();
    expect(execCommandSpy).toHaveBeenCalledWith('copy');
    expect(component.copySuccess).toBeTruthy();
  });

  it('should update preview when form values change', () => {
    component.signatureForm.patchValue({
      name: 'New Name',
      title: 'New Title'
    });
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const nameElement = compiled.querySelector('[data-name="name"]');
    expect(nameElement?.textContent?.trim()).toBe('New Name');
  });
});

