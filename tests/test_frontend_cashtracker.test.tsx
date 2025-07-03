import { render, screen, fireEvent } from '@testing-library/react';
import CashTracker from '../src/pages/CashTracker';

describe('CashTracker', () => {
  it('renders input fields and summary', () => {
    render(<CashTracker user={{ username: 'test' }} />);
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('shows error on invalid amount', () => {
    render(<CashTracker user={{ username: 'test' }} />);
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByText(/Add/i));
    expect(screen.getByText(/Enter a valid amount/i)).toBeInTheDocument();
  });
});
