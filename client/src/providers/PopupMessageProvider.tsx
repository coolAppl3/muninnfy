import { JSX, useCallback, useEffect, useState } from 'react';
import PopupMessage from '../components/PopupMessage/PopupMessage';
import PopupMessageContext from '../contexts/PopupMessageContext';

export default function PopupMessageProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [popupKey, setPopupKey] = useState(0);

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

  return (
    <PopupMessageContext.Provider value={{ displayPopupMessage }}>
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
