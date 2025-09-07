import { createContext, Dispatch, SetStateAction } from 'react';

export interface HistoryContextInterface {
  referrerLocation: string | null;
  setReferrerLocation: Dispatch<SetStateAction<string | null>>;

  postAuthNavigate: string | null;
  setPostAuthNavigate: Dispatch<SetStateAction<string | null>>;
}

const HistoryContext = createContext<HistoryContextInterface | null>(null);
export default HistoryContext;
