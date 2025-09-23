import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import PopupMessage from '../components/PopupMessage/PopupMessage';
import PopupMessageContext, { PopupMessageContextType } from '../contexts/PopupMessageContext';

export default function PopupMessageProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [popupKey, setPopupKey] = useState<number>(0);

  const displayPopupMessage = useCallback((message: string, type: 'success' | 'error'): void => {
    setMessage(message);
    setType(type);
    setIsVisible(true);
    setPopupKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timeoutId: number = setTimeout(() => {
      setIsVisible(false);
      setMessage('');
      setType('success');
    }, 2000);

    return () => clearTimeout(timeoutId);
  });

  const contextValue: PopupMessageContextType = useMemo(() => ({ displayPopupMessage }), [displayPopupMessage]);

  return (
    <PopupMessageContext.Provider value={contextValue}>
      {children}

      {isVisible && (
        <PopupMessage
          key={popupKey}
          type={type}
        >
          {message}
        </PopupMessage>
      )}
    </PopupMessageContext.Provider>
  );
}
