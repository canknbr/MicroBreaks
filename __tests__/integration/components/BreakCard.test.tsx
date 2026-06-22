import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { BreakCard } from '@/components/breaks/BreakCard';
import type { BreakListItem } from '@/components/breaks/types';
import { useTheme } from '@/hooks/useTheme';

const baseItem: BreakListItem = {
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

function Harness({
  item = baseItem,
  isFavorite = false,
  onPress = jest.fn(),
  onToggleFavorite = jest.fn(),
}: {
  item?: BreakListItem;
  isFavorite?: boolean;
  onPress?: (_item: BreakListItem) => void;
  onToggleFavorite?: (_id: string) => void;
}) {
  const theme = useTheme();
  return (
    <BreakCard
      item={item}
      index={0}
      categoryColor="#06FFA5"
      onPress={onPress}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      theme={theme}
    />
  );
}

describe('BreakCard', () => {
  it('renders the title, plain description, and duration for an unlocked break', () => {
    render(<Harness />);

    expect(screen.getByText('Box Breathing')).toBeTruthy();
    expect(screen.getByText('Calm your nervous system')).toBeTruthy();
    expect(screen.getByText('2 min')).toBeTruthy();
  });

  it('prefixes the description with "Pro •" when the break is locked', () => {
    render(<Harness item={{ ...baseItem, isLocked: true }} />);

    expect(screen.getByText('Pro • Calm your nervous system')).toBeTruthy();
  });

  it('invokes onPress with the item when the card is pressed', () => {
    const onPress = jest.fn();
    render(<Harness onPress={onPress} />);

    fireEvent.press(
      screen.getByLabelText('Box Breathing, 2 min, Calm your nervous system')
    );

    expect(onPress).toHaveBeenCalledWith(baseItem);
  });

  it('exposes an add-to-favorites action and toggles it by id', () => {
    const onToggleFavorite = jest.fn();
    render(<Harness onToggleFavorite={onToggleFavorite} />);

    fireEvent.press(screen.getByLabelText('Add Box Breathing to favorites'));

    expect(onToggleFavorite).toHaveBeenCalledWith('box-breathing');
  });

  it('reflects the favorited state in the accessibility label', () => {
    render(<Harness isFavorite />);

    expect(
      screen.getByLabelText('Remove Box Breathing from favorites')
    ).toBeTruthy();
  });
});
