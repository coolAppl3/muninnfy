import { createContext } from 'react';

export interface AuthSessionContextInterface {
  signOut: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionContextInterface | null>(null);
export default AuthSessionContext;
