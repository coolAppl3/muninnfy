import { Dispatch, JSX, SetStateAction } from 'react';

type ToggleSwitchProps = {
  isToggled: boolean;
  setIsToggled: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

export default function ToggleSwitch({ isToggled, setIsToggled, className }: ToggleSwitchProps): JSX.Element {
  return (
    <button
      type='button'
      title={isToggled ? 'Disable' : 'Enable'}
      aria-label={isToggled ? 'Disable' : 'Enable'}
      onClick={() => setIsToggled((prev) => !prev)}
      className={`flex justify-start items-center h-[1.4rem] w-4 rounded-pill cursor-pointer hover:brightness-75 transition-all ${
        isToggled ? 'bg-cta/30 brightness-100' : 'bg-dark brightness-50'
      } ${className || ''}`}
    >
      <div className={`h-2 w-2 bg-cta rounded-[50%] transition-transform ${isToggled ? 'translate-x-full' : ''}`}></div>
    </button>
  );
}
