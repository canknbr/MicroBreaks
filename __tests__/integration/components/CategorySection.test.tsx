import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { CategorySection } from '@/components/breaks/CategorySection';
import type {
  BreakCategorySectionData,
  BreakListItem,
} from '@/components/breaks/types';
import { useTheme } from '@/hooks/useTheme';

const breathing: BreakListItem = {
  id: 'box-breathing',
  title: 'Box Breathing',
  duration: '2 min',
  durationMinutes: 2,
  icon: '🫁',
  description: 'Calm your nervous system',
  category: 'mindful',
  color: '#06FFA5',
  isLocked: false,
};

const stretch: BreakListItem = {
  id: 'neck-rolls',
  title: 'Neck Rolls',
  duration: '1 min',
  durationMinutes: 1,
  icon: '🧘',
  description: 'Release neck tension',
  category: 'stretch',
  color: '#06FFA5',
  isLocked: false,
};

const baseCategory: BreakCategorySectionData = {
  id: 'mindful',
  title: 'Mindful Moments',
  subtitle: 'Reset your focus',
  icon: 'leaf',
  color: '#06FFA5',
  breaks: [breathing, stretch],
};

function Harness({
  category = baseCategory,
  favoriteBreaks = [],
  onBreakPress = jest.fn(),
  onToggleFavorite = jest.fn(),
}: {
  category?: BreakCategorySectionData;
  favoriteBreaks?: string[];
  onBreakPress?: (_item: BreakListItem) => void;
  onToggleFavorite?: (_id: string) => void;
}) {
  const theme = useTheme();
  return (
    <CategorySection
      category={category}
      delay={0}
      onBreakPress={onBreakPress}
      favoriteBreaks={favoriteBreaks}
      onToggleFavorite={onToggleFavorite}
      theme={theme}
    />
  );
}

describe('CategorySection', () => {
  it('renders the category title and subtitle', () => {
    render(<Harness />);

    expect(screen.getByText('Mindful Moments')).toBeTruthy();
    expect(screen.getByText('Reset your focus')).toBeTruthy();
  });

  it('renders a card for each break in the category', () => {
    render(<Harness />);

    expect(screen.getByText('Box Breathing')).toBeTruthy();
    expect(screen.getByText('Neck Rolls')).toBeTruthy();
  });

  it('forwards onBreakPress with the pressed break item', () => {
    const onBreakPress = jest.fn();
    render(<Harness onBreakPress={onBreakPress} />);

    fireEvent.press(
      screen.getByLabelText('Box Breathing, 2 min, Calm your nervous system')
    );

    expect(onBreakPress).toHaveBeenCalledWith(breathing);
  });

  it('marks a break as favorited when it is in favoriteBreaks', () => {
    render(<Harness favoriteBreaks={['box-breathing']} />);

    expect(
      screen.getByLabelText('Remove Box Breathing from favorites')
    ).toBeTruthy();
  });
});
