import { useEffect } from 'react';

type HeadProps = {
  title: string;
  metaDescription: string;
};

export default function Head({ title, metaDescription }: HeadProps) {
  useEffect(() => {
    document.title = title;
    let metaElement: Element | null = document.querySelector(`meta[name="description"]`);

    if (!metaElement) {
      metaElement = document.createElement('meta');
      metaElement.setAttribute('name', 'description');
      document.head.appendChild(metaElement);
    }

    metaElement.setAttribute('content', metaDescription);
  }, [title, metaDescription]);

  return null;
}
