import { createContext } from 'react';

export type ViewModeContextType = {
  inViewMode: boolean;
  publicAccountId?: string;
};

const ViewModeContext = createContext<ViewModeContextType | null>(null);
export default ViewModeContext;
