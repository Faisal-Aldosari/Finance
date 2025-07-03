import { render, screen, fireEvent } from '@testing-library/react';
import DataUploadPage from '../src/pages/DataUploadPage';

describe('DataUploadPage validation', () => {
  it('shows error if no file is selected', async () => {
    render(<DataUploadPage />);
    fireEvent.click(screen.getByText(/Upload/i));
    expect(window.alert).toBeCalledWith('Please select a file to upload.');
  });
  it('shows error if file type is not allowed', async () => {
    render(<DataUploadPage />);
    const file = new File(['bad'], 'bad.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/file/i);
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);
    fireEvent.click(screen.getByText(/Upload/i));
    expect(window.alert).toBeCalledWith('Only CSV or Excel files are allowed.');
  });
});
