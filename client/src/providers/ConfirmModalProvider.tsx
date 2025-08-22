import { JSX, ReactNode, useEffect, useState } from 'react';
import ConfirmModal, { ConfirmModalProps } from '../components/ConfirmModal/ConfirmModal';
import ConfirmModalContext from '../contexts/ConfirmModalContext';
import { Location, useLocation } from 'react-router-dom';

export default function ConfirmModalProvider({ children }: { children: ReactNode }): JSX.Element {
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
    onCancel: removeConfirmModal,
    onExtraAction: () => {},
  });

  useEffect(() => {
    removeConfirmModal();
  }, [routerLocation]);

  function displayConfirmModal(props: ConfirmModalProps): void {
    setConfirmModalState({ ...props });
    setIsVisible(true);
  }

  function removeConfirmModal(): void {
    setIsVisible(false);
    setConfirmModalState({
      title: undefined,
      description: undefined,

      confirmBtnTitle: 'Confirm',
      cancelBtnTitle: 'Cancel',
      extraBtnTitle: undefined,

      isDangerous: false,

      onConfirm: () => {},
      onCancel: removeConfirmModal,
      onExtraAction: () => {},
    });
  }

  return (
    <ConfirmModalContext.Provider value={{ displayConfirmModal, removeConfirmModal }}>
      {children}

      {isVisible && <ConfirmModal {...confirmModalState} />}
    </ConfirmModalContext.Provider>
  );
}
