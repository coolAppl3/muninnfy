import { createContext, Dispatch, SetStateAction } from 'react';

export interface AuthContextInterface {
  isSignedIn: boolean;
  setIsSignedIn: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);
export default AuthContext;
