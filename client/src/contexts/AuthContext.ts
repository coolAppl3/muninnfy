import { createContext } from 'react';

export interface AuthContextInterface {
  isSignedIn: boolean;
  setIsSignedIn: (newValue: boolean) => void;
}

const AuthContext = createContext<AuthContextInterface | null>(null);
export default AuthContext;
