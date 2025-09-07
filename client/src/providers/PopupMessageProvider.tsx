import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import PopupMessage from '../components/PopupMessage/PopupMessage';
import PopupMessageContext, { PopupMessageContextInterface } from '../contexts/PopupMessageContext';

export default function PopupMessageProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [popupKey, setPopupKey] = useState<number>(0);

  const displayPopupMessage = useCallback((message: string, type: 'success' | 'error'): void => {
    setMessage(message);
    setType(type);
    setVisible(true);
    setPopupKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeoutId: number = setTimeout(() => {
      setVisible(false);
      setMessage('');
      setType('success');
    }, 2000);

    return () => clearTimeout(timeoutId);
  });

  const contextValue: PopupMessageContextInterface = useMemo(() => ({ displayPopupMessage }), [displayPopupMessage]);

  return (
    <PopupMessageContext.Provider value={contextValue}>
      {children}

      {visible && (
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
