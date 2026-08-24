import {
  FieldErrorsImpl,
  UseFormRegister,
  UseFormSetError,
} from 'react-hook-form';
import { CreateUserParams } from '../types';

export type RegisterFormFieldProps = {
  register: UseFormRegister<CreateUserParams>;
  setError: UseFormSetError<CreateUserParams>;
  errors: FieldErrorsImpl<{
    phoneNumber: string;
    firstName: string;
    lastName: string;
    password: string;
  }>;
};
