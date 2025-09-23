import { createContext, Dispatch, SetStateAction } from 'react';

export type HistoryContextType = {
  referrerLocation: string | null;
  setReferrerLocation: Dispatch<SetStateAction<string | null>>;

  postAuthNavigate: string | null;
  setPostAuthNavigate: Dispatch<SetStateAction<string | null>>;
};

const HistoryContext = createContext<HistoryContextType | null>(null);
export default HistoryContext;
