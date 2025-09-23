import { createContext, Dispatch, SetStateAction } from 'react';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
export type AuthContextType = {
  authStatus: AuthStatus;
  setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
};

const AuthContext = createContext<AuthContextType | null>(null);
export default AuthContext;
