import { JSX, ReactNode, useEffect, useState } from 'react';
import InfoModalContext from '../contexts/InfoModalContext';
import InfoModal, { InfoModalProps } from '../components/InfoModal/InfoModal';
import { Location, useLocation } from 'react-router-dom';

export default function InfoModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const routerLocation: Location = useLocation();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [InfoModalState, setInfoModalState] = useState<InfoModalProps>({
    title: undefined,
    description: undefined,
    btnTitle: 'Okay',
    onClick: removeInfoModal,
  });

  useEffect(() => {
    removeInfoModal();
  }, [routerLocation]);

  function displayInfoModal(props: InfoModalProps): void {
    setInfoModalState({ ...props });
    setIsVisible(true);
  }

  function removeInfoModal(): void {
    setIsVisible(false);
    setInfoModalState({
      title: undefined,
      description: undefined,
      btnTitle: 'Okay',
      onClick: removeInfoModal,
    });
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
