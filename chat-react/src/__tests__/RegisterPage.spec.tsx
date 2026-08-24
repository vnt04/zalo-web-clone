import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';
import { RegisterPage } from '../pages/RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form field', () => {
    const view = render(
      <Router>
        <RegisterPage />
      </Router>
    );
    expect(view).toMatchSnapshot();
  });

  it('should display all errors when submitting with all empty fields', async () => {
    render(
      <Router>
        <RegisterPage />
      </Router>
    );
    const submitButton = screen.getByRole('button', {
      name: 'Create My Account',
    });
    submitButton.click();
    const phoneNumberError = await screen.findByText('PhoneNumber is required');
    const firstNameError = await screen.findByText('First Name is Required');
    const lastNameError = await screen.findByText('Last Name is Required');
    const passwordError = await screen.findByText('Password is Required');
    await waitFor(() => {
      expect(phoneNumberError).toBeInTheDocument();
    });
    expect(firstNameError).toBeInTheDocument();
    expect(lastNameError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
  });

  it('should submit empty phoneNumber field then remove error after typing and leaving focus', async () => {
    render(
      <Router>
        <RegisterPage />
      </Router>
    );
    const submitButton = screen.getByRole('button');
    submitButton.click();
    const phoneNumberError = await screen.findByText('PhoneNumber is required');
    await waitFor(() => {
      expect(phoneNumberError).toBeInTheDocument();
    });
    const phoneNumberField = await screen.findByLabelText('PhoneNumber');
    const firstNameField = await screen.findByLabelText('First Name');
    expect(phoneNumberField).toBeInTheDocument();
    expect(firstNameField).toBeInTheDocument();
    userEvent.type(phoneNumberField, 'helloworld');
    userEvent.click(firstNameField);
    await waitForElementToBeRemoved(() =>
      screen.queryByText('PhoneNumber is required')
    );
  });
});
