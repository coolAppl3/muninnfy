import { createContext, Dispatch } from 'react';

export interface AuthContextInterface {
  isSignedIn: boolean;
  setIsSignedIn: Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextInterface | null>(null);
export default AuthContext;
