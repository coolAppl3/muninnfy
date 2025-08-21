import { JSX, ReactNode, useState } from 'react';
import InfoModalContext from '../contexts/InfoModalContext';
import InfoModal, { InfoModalProps } from '../components/InfoModal/InfoModal';

export default function InfoModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const [InfoModalState, setInfoModalState] = useState<InfoModalProps>({
    title: undefined,
    description: undefined,
    btnTitle: 'Okay',
    onClick: removeInfoModal,
  });

  function displayInfoModal(props: InfoModalProps): void {
    setInfoModalState({ ...props });
    setIsVisible(true);
  }

  function removeInfoModal(): void {
    setIsVisible(false);
  }

  const { title, description, btnTitle, onClick } = InfoModalState;
  return (
    <InfoModalContext.Provider value={{ displayInfoModal, removeInfoModal }}>
      {children}

      {isVisible && (
        <InfoModal
          title={title}
          description={description}
          btnTitle={btnTitle}
          onClick={onClick}
        />
      )}
    </InfoModalContext.Provider>
  );
}
