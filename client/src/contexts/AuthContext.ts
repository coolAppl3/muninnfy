import { createContext, Dispatch, SetStateAction } from 'react';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
export interface AuthContextInterface {
  authStatus: AuthStatus;
  setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);
export default AuthContext;
