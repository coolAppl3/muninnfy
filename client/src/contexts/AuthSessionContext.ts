import { createContext } from 'react';

export type AuthSessionContextType = {
  signOut: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextType | null>(null);
export default AuthSessionContext;
