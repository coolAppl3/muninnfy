import { JSX, ReactNode } from 'react';
import ViewModeContext from '../contexts/ViewModeContext';

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
  return <ViewModeContext value={{ inViewMode, publicAccountId }}>{children}</ViewModeContext>;
}
