import { Dispatch, JSX, SetStateAction } from 'react';
import './ToggleSwitch.css';

export default function ToggleSwitch({
  isToggled,
  setIsToggled,
  className,
}: {
  isToggled: boolean;
  setIsToggled: Dispatch<SetStateAction<boolean>>;
  className?: string;
}): JSX.Element {
  return (
    <button
      type='button'
      className={`toggle-switch-btn ${isToggled ? 'toggled' : ''} ${className ? className : ''}`}
      onClick={() => setIsToggled((prev) => !prev)}
    >
      <div className='thumb'></div>
    </button>
  );
}
