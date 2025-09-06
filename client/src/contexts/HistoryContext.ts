import { createContext, Dispatch, SetStateAction } from 'react';

export interface HistoryContextInterface {
  referrerPathname: string | null;
  setReferrerPathname: Dispatch<SetStateAction<string | null>>;
  postAuthRedirectPathname: string | null;
  setPostAuthRedirectPathname: Dispatch<SetStateAction<string | null>>;
}

const HistoryContext = createContext<HistoryContextInterface | null>(null);
export default HistoryContext;
