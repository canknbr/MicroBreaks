import {
  generateBuddyCode,
  validateBuddyCode,
} from '@/services/buddies/inviteCodes';
import { BUDDY_CODE_LENGTH } from '@/services/buddies/types';

describe('validateBuddyCode', () => {
  it('accepts a clean 6-char alphabet code', () => {
    expect(validateBuddyCode('QX3D9F')).toBe('QX3D9F');
  });

  it('normalizes case + strips whitespace', () => {
    expect(validateBuddyCode('  qx3d9f  ')).toBe('QX3D9F');
    expect(validateBuddyCode('qx3 d9f')).toBe('QX3D9F');
  });

  it('rejects empty / null / undefined input', () => {
    expect(validateBuddyCode('')).toBeNull();
    expect(validateBuddyCode(null)).toBeNull();
    expect(validateBuddyCode(undefined)).toBeNull();
  });

  it('rejects codes with look-alike characters (0, O, 1, I, L)', () => {
    expect(validateBuddyCode('Q0XD9F')).toBeNull();
    expect(validateBuddyCode('QOXD9F')).toBeNull();
    expect(validateBuddyCode('Q1XD9F')).toBeNull();
    expect(validateBuddyCode('QIXD9F')).toBeNull();
    expect(validateBuddyCode('QLXD9F')).toBeNull();
  });

  it('rejects codes of the wrong length', () => {
    expect(validateBuddyCode('QX3D9')).toBeNull();    // too short
    expect(validateBuddyCode('QX3D9FZ')).toBeNull();  // too long
  });

  it('rejects codes with special characters', () => {
    expect(validateBuddyCode('QX3-9F')).toBeNull();
    expect(validateBuddyCode('QX3.9F')).toBeNull();
  });
});

describe('generateBuddyCode', () => {
  it('returns a string of the expected length', () => {
    const code = generateBuddyCode();
    expect(code).toHaveLength(BUDDY_CODE_LENGTH);
  });

  it('uses only characters in the safe alphabet', () => {
    // Deterministic rng for repeatability.
    const code = generateBuddyCode(() => 0.5);
    expect(validateBuddyCode(code)).toBe(code);
  });

  it('is deterministic given a deterministic rng', () => {
    function makeRng(): () => number {
      const seq = [0.1, 0.3, 0.5, 0.7, 0.9, 0.2];
      let i = 0;
      return () => seq[i++ % seq.length];
    }
    expect(generateBuddyCode(makeRng())).toBe(generateBuddyCode(makeRng()));
  });

  it('produces codes that pass validateBuddyCode (round trip)', () => {
    // Try a handful of random codes; each must validate.
    for (let i = 0; i < 50; i += 1) {
      const code = generateBuddyCode();
      expect(validateBuddyCode(code)).toBe(code);
    }
  });
});
