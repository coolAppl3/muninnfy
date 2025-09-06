import { createContext, Dispatch, SetStateAction } from 'react';

export interface AuthContextInterface {
  isSignedIn: boolean;
  setIsSignedIn: Dispatch<SetStateAction<boolean>>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);
export default AuthContext;
