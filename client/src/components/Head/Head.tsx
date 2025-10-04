import { useEffect } from 'react';

type HeadProps = {
  title: string;
};

export default function Head({ title }: HeadProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
