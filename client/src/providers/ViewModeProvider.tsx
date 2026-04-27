import { JSX, ReactNode, useMemo } from 'react';
import ViewModeContext, { ViewModeContextType } from '../contexts/ViewModeContext';

type ViewModeProviderProps = {
  inViewMode: boolean;
  publicAccountId?: string;

  children: ReactNode;
};

export default function ViewModeProvider({
  inViewMode,
  publicAccountId,

  children,
}: ViewModeProviderProps): JSX.Element {
  const contextValue: ViewModeContextType = useMemo(
    () => ({ inViewMode, publicAccountId }),
    [inViewMode, publicAccountId]
  );

  return <ViewModeContext value={contextValue}>{children}</ViewModeContext>;
}
