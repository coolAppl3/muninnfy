import { JSX, ReactNode, useState } from 'react';
import ConfirmModal, { ConfirmModalProps } from '../components/ConfirmModal/ConfirmModal';
import ConfirmModalContext from '../contexts/ConfirmModalContext';

export default function ConfirmModalProvider({ children }: { children: ReactNode }): JSX.Element {
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

  function displayConfirmModal(props: ConfirmModalProps): void {
    setConfirmModalState({ ...props });
    setIsVisible(true);
  }

  function removeConfirmModal(): void {
    setIsVisible(false);
  }

  return (
    <ConfirmModalContext.Provider value={{ displayConfirmModal, removeConfirmModal }}>
      {children}

      {isVisible && <ConfirmModal {...confirmModalState} />}
    </ConfirmModalContext.Provider>
  );
}
