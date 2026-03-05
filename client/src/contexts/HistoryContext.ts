import { createContext, Dispatch, SetStateAction } from 'react';

export type HistoryContextType = {
  referrerLocation: string | null;
  setReferrerLocation: (newReferrerLocation: string | null) => void;

  postAuthNavigate: string | null;
  setPostAuthNavigate: Dispatch<SetStateAction<string | null>>;
};

const HistoryContext = createContext<HistoryContextType | null>(null);
export default HistoryContext;

// }
