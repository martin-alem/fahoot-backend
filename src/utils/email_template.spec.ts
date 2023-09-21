import { createEmailVerificationTemplate, createPasswordResetTemplate } from './email_templates';

describe('Create Email Verification Template', () => {
  it('should insert the link correctly', () => {
    const link = 'https://example.com/verify';
    const result = createEmailVerificationTemplate(link);
    expect(result).toContain(link);
    expect(result.match(/https:\/\/example\.com\/verify/g)?.length).toEqual(3);
  });

  it('should handle special characters in the link', () => {
    const link = 'https://example.com/verify?id=123&token=!@#$%^&*()';
    const result = createEmailVerificationTemplate(link);
    expect(result).toContain(link);
  });

  it('should return a complete HTML document', () => {
    const link = 'https://example.com/verify';
    const result = createEmailVerificationTemplate(link);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('</html>');
  });
});

describe('Create Password Reset Template', () => {
  it('should insert the link correctly', () => {
    const link = 'https://example.com/reset';
    const result = createPasswordResetTemplate(link);
    expect(result).toContain(link);
    expect(result.match(/https:\/\/example\.com\/reset/g)?.length).toEqual(3);
  });

  it('should handle special characters in the link', () => {
    const link = 'https://example.com/reset?id=123&token=!@#$%^&*()';
    const result = createPasswordResetTemplate(link);
    expect(result).toContain(link);
  });

  it('should return a complete HTML document', () => {
    const link = 'https://example.com/reset';
    const result = createPasswordResetTemplate(link);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('</html>');
  });
});
