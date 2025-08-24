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

interface ValidateField {
  type: 'VALIDATE_FIELD';
  payload: ChangeEvent<HTMLInputElement>;
}

interface ValidateAllFields {
  type: 'VALIDATE_ALL_FIELDS';
  payload: null;
}

interface AddFieldError {
  type: 'ADD_FIELD_ERROR';
  payload: { errMessage: string; errReason: string };
}

export function signUpFormValidationReducer(
  state: FormValidationState,
  action: ValidateField | ValidateAllFields | AddFieldError
): FormValidationState {
  const { type, payload } = action;

  if (type === 'VALIDATE_ALL_FIELDS') {
    const { displayName, username, email, password, confirmPassword } = state.formData;

    const updatedState: FormValidationState = {
      ...state,
      formErrors: {
        displayName: validateDisplayName(displayName),
        username: validateUsername(username),
        email: validateEmail(email),
        password: validateNewPassword(password) || (password === username ? `Username and password can't match.` : null),
        confirmPassword: confirmPassword === password ? null : `Passwords don't match.`,
      },
    };

    return updatedState;
  }

  if (type === 'ADD_FIELD_ERROR') {
    const { errMessage, errReason } = payload;

    const inputRecord: Record<string, string> = {
      invalidEmail: 'email',
      invalidUsername: 'username',
      invalidPassword: 'password',
      invalidDisplayName: 'displayName',

      emailTaken: 'email',
      usernameTaken: 'username',
      passwordMatchesUsername: 'password',
    };

    const fieldName: string | undefined = inputRecord[errReason];

    if (!fieldName) {
      return state;
    }

    const updatedState: FormValidationState = {
      ...state,
      formErrors: {
        ...state.formErrors,
        [fieldName]: errMessage,
      },
    };

    return updatedState;
  }

  const { name, value } = payload.target;

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
