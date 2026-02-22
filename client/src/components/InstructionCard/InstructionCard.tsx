import { JSX } from 'react';
import Button from '../Button/Button';

type InstructionCardProps = {
  title: string;
  description: string;
  btnTitle: string;
  btnDisabled: boolean;
  onClick: () => void;
};

export default function InstructionCard({ title, description, btnTitle, btnDisabled = false, onClick }: InstructionCardProps): JSX.Element {
  return (
    <>
      <h4 className='text-title font-medium mb-1'>{title}</h4>
      <p className='text-description text-sm mb-2'>{description}</p>

      <Button
        className='bg-description border-description text-dark w-full'
        disabled={btnDisabled}
        onClick={onClick}
      >
        {btnTitle}
      </Button>
    </>
  );
}
