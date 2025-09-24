import { ChangeEvent } from 'react';
import { validateDisplayName, validateEmail, validateNewPassword, validateUsername } from '../../utils/validation/userValidation';

type FormData = {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  displayName: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
};

type SignUpFormValidationState = {
  formData: FormData;
  formErrors: FormErrors;
};

export const initialSignUpFormValidationState: SignUpFormValidationState = {
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

type ValidateField = {
  type: 'VALIDATE_FIELD';
  payload: ChangeEvent<HTMLInputElement>;
};

type ValidateAllFields = {
  type: 'VALIDATE_ALL_FIELDS';
  payload: null;
};

type AddFieldError = {
  type: 'ADD_FIELD_ERROR';
  payload: { errMessage: string; errReason: string };
};

export default function signUpFormValidationReducer(
  state: SignUpFormValidationState,
  action: ValidateField | ValidateAllFields | AddFieldError
): SignUpFormValidationState {
  const { type, payload } = action;

  if (type === 'VALIDATE_ALL_FIELDS') {
    const { displayName, username, email, password, confirmPassword } = state.formData;

    const updatedState: SignUpFormValidationState = {
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

    const errFieldRecord: Record<string, string> = {
      invalidEmail: 'email',
      invalidUsername: 'username',
      invalidPassword: 'password',
      invalidDisplayName: 'displayName',

      emailTaken: 'email',
      usernameTaken: 'username',
      passwordMatchesUsername: 'password',
    };

    const fieldName: string | undefined = errFieldRecord[errReason];

    if (!fieldName) {
      return state;
    }

    const updatedState: SignUpFormValidationState = {
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
    const updatedState: SignUpFormValidationState = {
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
    const updatedState: SignUpFormValidationState = {
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
    const updatedState: SignUpFormValidationState = {
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
