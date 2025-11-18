import { JSX } from 'react';

type StatisticItemProps = {
  title: string;
  value: string;
};

export default function StatisticItem({ title, value }: StatisticItemProps): JSX.Element {
  return (
    <div className='grid'>
      <span className='font-medium text-title'>{value}</span>
      <span className='text-xs font-medium'>{title}</span>
    </div>
  );
}
