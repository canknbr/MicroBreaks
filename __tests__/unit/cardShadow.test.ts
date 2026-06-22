import { cardShadow } from '@/utils/cardShadow';

describe('cardShadow', () => {
  it('emits a standard drop shadow in light mode', () => {
    expect(cardShadow(false, { height: 2, opacity: 0.08, radius: 10, elevation: 4 })).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    });
  });

  it('zeroes opacity and elevation in dark mode so cards read flat', () => {
    const s = cardShadow(true, { height: 3, opacity: 0.06, radius: 12, elevation: 5 });
    expect(s.shadowOpacity).toBe(0);
    expect(s.elevation).toBe(0);
  });

  it('preserves color, offset and radius regardless of theme', () => {
    const s = cardShadow(true, { height: 4, opacity: 0.08, radius: 16, elevation: 5 });
    expect(s.shadowColor).toBe('#000');
    expect(s.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(s.shadowRadius).toBe(16);
  });
});
