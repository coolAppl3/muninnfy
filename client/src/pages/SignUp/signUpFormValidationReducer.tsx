import { ChangeEvent } from 'react';
import { validateDisplayName, validateEmail, validateNewPassword, validateUsername } from '../../utils/validation';

interface FormData {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}

export interface FormValidationState {
  formData: FormData;
  formErrors: FormErrors;
}

export const initialSignUpFormValidationState: FormValidationState = {
  formData: {
    displayName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },

  formErrors: {
    displayName: null,
    username: null,
    email: null,
    password: null,
    confirmPassword: null,
  },
};

interface Action {
  type: 'UPDATE_FIELD';
  payload: ChangeEvent<HTMLInputElement>;
}

export function signUpFormValidationReducer(state: FormValidationState, action: Action): FormValidationState {
  const { type, payload } = action;
  const { name, value } = payload.target;

  if (type !== 'UPDATE_FIELD') {
    return state;
  }

  if (name === 'displayName' || name === 'username' || name === 'email') {
    const updatedState: FormValidationState = {
      formData: {
        ...state.formData,
        [name]: value,
      },

      formErrors: {
        ...state.formErrors,
        [name]: fieldValidators[name](value),
      },
    };

    return updatedState;
  }

  if (name === 'password') {
    const updatedState: FormValidationState = {
      formData: {
        ...state.formData,
        password: value,
      },

      formErrors: {
        ...state.formErrors,
        password: validateNewPassword(value),
        confirmPassword: value === state.formData.confirmPassword ? null : `Passwords don't match.`,
      },
    };

    return updatedState;
  }

  if (name === 'confirmPassword') {
    const updatedState: FormValidationState = {
      formData: {
        ...state.formData,
        confirmPassword: value,
      },

      formErrors: {
        ...state.formErrors,
        confirmPassword: value === state.formData.password ? null : `Passwords don't match.`,
      },
    };

    return updatedState;
  }

  return state;
}

const fieldValidators = {
  displayName: validateDisplayName,
  username: validateUsername,
  email: validateEmail,
} as const;
