import { JSX } from 'react';

type StatisticItemProps = {
  title: string;
  value: string;
  className?: string;
};

export default function StatisticItem({ title, value, className }: StatisticItemProps): JSX.Element {
  return (
    <div className={`grid ${className || ''}`}>
      <span className='font-medium text-title'>{value}</span>
      <span className='text-xs font-medium'>{title}</span>
    </div>
  );
}
