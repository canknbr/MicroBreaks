import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { FilterChips } from '@/components/breaks/FilterChips';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  selectedCategory = null,
  selectedDuration = 'all',
  onCategoryChange = jest.fn(),
  onDurationChange = jest.fn(),
}: {
  selectedCategory?: string | null;
  selectedDuration?: string;
  onCategoryChange?: (_id: string | null) => void;
  onDurationChange?: (_id: string) => void;
}) {
  const theme = useTheme();
  return (
    <FilterChips
      selectedCategory={selectedCategory}
      selectedDuration={selectedDuration}
      onCategoryChange={onCategoryChange}
      onDurationChange={onDurationChange}
      theme={theme}
    />
  );
}

describe('FilterChips', () => {
  it('renders the favorites chip and the duration labels', () => {
    render(<Harness />);

    expect(screen.getByText('Favorites')).toBeTruthy();
    expect(screen.getByText('1-2m')).toBeTruthy();
    expect(screen.getByText('3-5m')).toBeTruthy();
    expect(screen.getByText('5m+')).toBeTruthy();
  });

  it('selects the favorites category when its chip is pressed', () => {
    const onCategoryChange = jest.fn();
    render(<Harness onCategoryChange={onCategoryChange} />);

    fireEvent.press(screen.getByText('Favorites'));

    expect(onCategoryChange).toHaveBeenCalledWith('favorites');
  });

  it('changes the duration filter when a duration chip is pressed', () => {
    const onDurationChange = jest.fn();
    render(<Harness onDurationChange={onDurationChange} />);

    fireEvent.press(screen.getByText('1-2m'));

    expect(onDurationChange).toHaveBeenCalledWith('quick');
  });
});
