import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmModal, { ConfirmModalProps } from '../components/ConfirmModal/ConfirmModal';
import ConfirmModalContext, { ConfirmModalContextType } from '../contexts/ConfirmModalContext';
import { Location, useLocation } from 'react-router-dom';

type ConfirmModalProviderProps = {
  children: ReactNode;
};

export default function ConfirmModalProvider({ children }: ConfirmModalProviderProps): JSX.Element {
  const routerLocation: Location = useLocation();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalProps>({
    title: undefined,
    description: undefined,

    confirmBtnTitle: 'Confirm',
    cancelBtnTitle: 'Cancel',
    extraBtnTitle: undefined,

    isDangerous: false,

    onConfirm: () => {},
    onCancel: () => {},
    onExtraAction: () => {},
  });

  const displayConfirmModal = useCallback((props: ConfirmModalProps) => {
    setConfirmModalState({ ...props });
    setIsVisible(true);
  }, []);

  const removeConfirmModal = useCallback(() => {
    setIsVisible(false);
    setConfirmModalState({
      title: undefined,
      description: undefined,

      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      extraBtnTitle: undefined,

      isDangerous: false,

      onConfirm: () => {},
      onCancel: () => {},
      onExtraAction: () => {},
    });
  }, []);

  useEffect(() => {
    return removeConfirmModal;
  }, [routerLocation, removeConfirmModal]);

  const contextValue: ConfirmModalContextType = useMemo(
    () => ({
      displayConfirmModal,
      removeConfirmModal,
    }),
    [displayConfirmModal, removeConfirmModal]
  );

  return (
    <ConfirmModalContext value={contextValue}>
      {children}

      {isVisible && <ConfirmModal {...confirmModalState} />}
    </ConfirmModalContext>
  );
}
