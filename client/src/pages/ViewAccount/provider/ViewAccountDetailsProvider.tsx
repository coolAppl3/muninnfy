import { JSX, ReactNode, useMemo, useState } from 'react';
import ViewAccountDetailsContext, {
  ViewAccountDetailsContextType,
} from '../contexts/ViewAccountDetailsContext';
import { ViewAccountDetailsType } from '../../../types/accountTypes';

type ViewAccountDetailsProviderProps = {
  initialViewAccountDetails: ViewAccountDetailsType;
  children: ReactNode;
};

export default function ViewAccountDetailsProvider({
  initialViewAccountDetails,
  children,
}: ViewAccountDetailsProviderProps): JSX.Element {
  const [viewAccountDetails, setViewAccountDetails] = useState<ViewAccountDetailsType>(
    initialViewAccountDetails
  );

  const contextValue: ViewAccountDetailsContextType = useMemo(
    () => ({ viewAccountDetails, setViewAccountDetails }),
    [viewAccountDetails]
  );

  return <ViewAccountDetailsContext value={contextValue}>{children}</ViewAccountDetailsContext>;
}
