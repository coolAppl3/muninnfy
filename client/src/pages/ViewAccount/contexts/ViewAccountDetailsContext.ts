import { createContext, Dispatch, SetStateAction } from 'react';
import { ViewAccountDetailsType } from '../../../types/accountTypes';

export type ViewAccountDetailsContextType = {
  viewAccountDetails: ViewAccountDetailsType;
  setViewAccountDetails: Dispatch<SetStateAction<ViewAccountDetailsType>>;
};

const ViewAccountDetailsContext = createContext<ViewAccountDetailsContextType | null>(null);
export default ViewAccountDetailsContext;
