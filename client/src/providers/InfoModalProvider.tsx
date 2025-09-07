import { JSX, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import InfoModalContext, { InfoModalContextInterface } from '../contexts/InfoModalContext';
import InfoModal, { InfoModalProps } from '../components/InfoModal/InfoModal';
import { Location, useLocation } from 'react-router-dom';

export default function InfoModalProvider({ children }: { children: ReactNode }): JSX.Element {
  const routerLocation: Location = useLocation();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [InfoModalState, setInfoModalState] = useState<InfoModalProps>({
    title: undefined,
    description: undefined,
    btnTitle: 'Okay',
    onClick: () => {},
  });

  const displayInfoModal = useCallback((props: InfoModalProps): void => {
    setInfoModalState({ ...props });
    setIsVisible(true);
  }, []);

  const removeInfoModal = useCallback((): void => {
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
  const contextValue: InfoModalContextInterface = useMemo(
    () => ({ displayInfoModal, removeInfoModal }),
    [displayInfoModal, removeInfoModal]
  );

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
