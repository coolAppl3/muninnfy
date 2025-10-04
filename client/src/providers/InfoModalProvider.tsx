import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import InfoModalContext, { InfoModalContextType } from '../contexts/InfoModalContext';
import InfoModal, { InfoModalProps } from '../components/InfoModal/InfoModal';
import { Location, useLocation } from 'react-router-dom';

type InfoModalProviderProps = {
  children: ReactNode;
};

export default function InfoModalProvider({ children }: InfoModalProviderProps): JSX.Element {
  const routerLocation: Location = useLocation();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [InfoModalState, setInfoModalState] = useState<InfoModalProps>({
    title: undefined,
    description: undefined,
    btnTitle: 'Okay',
    onClick: () => {},
  });

  const displayInfoModal = useCallback((props: InfoModalProps) => {
    setInfoModalState({ ...props });
    setIsVisible(true);
  }, []);

  const removeInfoModal = useCallback(() => {
    setIsVisible(false);
    setInfoModalState({
      title: undefined,
      description: undefined,
      btnTitle: 'Okay',
      onClick: () => {},
    });
  }, []);

  useEffect(() => {
    return removeInfoModal;
  }, [routerLocation, removeInfoModal]);

  const { title, description, btnTitle, onClick } = InfoModalState;
  const contextValue: InfoModalContextType = useMemo(() => ({ displayInfoModal, removeInfoModal }), [displayInfoModal, removeInfoModal]);

  return (
    <InfoModalContext.Provider value={contextValue}>
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
