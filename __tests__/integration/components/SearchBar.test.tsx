import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { SearchBar } from '@/components/breaks/SearchBar';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  value = '',
  onChangeText = jest.fn(),
  onClear = jest.fn(),
}: {
  value?: string;
  onChangeText?: (_text: string) => void;
  onClear?: () => void;
}) {
  const theme = useTheme();
  return (
    <SearchBar
      value={value}
      onChangeText={onChangeText}
      onClear={onClear}
      theme={theme}
    />
  );
}

describe('SearchBar', () => {
  it('renders the search input with its placeholder', () => {
    render(<Harness />);

    expect(screen.getByPlaceholderText('Search breaks...')).toBeTruthy();
  });

  it('forwards typed text through onChangeText', () => {
    const onChangeText = jest.fn();
    render(<Harness onChangeText={onChangeText} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('Search breaks...'),
      'breathe'
    );

    expect(onChangeText).toHaveBeenCalledWith('breathe');
  });

  it('renders as a controlled input reflecting the current query', () => {
    render(<Harness value="breathe" />);

    expect(screen.getByDisplayValue('breathe')).toBeTruthy();
  });
});
