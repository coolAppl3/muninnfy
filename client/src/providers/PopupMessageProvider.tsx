import { useEffect, useState } from 'react';
import PopupMessage from '../components/PopupMessage/PopupMessage';
import { PopupMessageContext } from '../contexts/PopupMessageContext';

export default function PopupMessageProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [popupKey, setPopupKey] = useState(0);

  function displayPopupMessage(message: string, type: 'success' | 'error'): void {
    setMessage(message);
    setType(type);
    setVisible(true);
    setPopupKey((prev) => prev + 1);
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setMessage('');
      setType('success');
    }, 2000);

    return () => clearTimeout(timer);
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
