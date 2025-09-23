import { FunctionComponent, JSX, SVGProps } from 'react';
import Container from '../../components/Container/Container';
import EyeIcon from '../../assets/svg/EyeIcon.svg?react';
import MagnifyingGlassIcon from '../../assets/svg/MagnifyingGlassIcon.svg?react';
import SlidersIcon from '../../assets/svg/SlidersIcon.svg?react';
import CheckBoxIcon from '../../assets/svg/CheckBoxIcon.svg?react';
import HashtagIcon from '../../assets/svg/HashtagIcon.svg?react';
import MultipleWishlistsIcon from '../../assets/svg/MultipleWishlistsIcon.svg?react';

export default function Features(): JSX.Element {
  return (
    <section className='features py-4'>
      <Container>
        <h2 className='text-title text-4xl font-bold mb-2'>Wish Big. Do More.</h2>

        <div className='features-container grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            title='Multiple Wishlists'
            description='Create a collection separate wishlists for every occasion or interest — all in one place.'
            Icon={MultipleWishlistsIcon}
          />

          <FeatureCard
            title='Control Visibility'
            description='Keep wishlists private or share them with your followers — you decide who sees what.'
            Icon={EyeIcon}
          />

          <FeatureCard
            title='Powerful Search'
            description={`Quickly find any item, whether it's in one list or across your entire collection.`}
            Icon={MagnifyingGlassIcon}
          />

          <FeatureCard
            title='Tailor Your Wishlists'
            description='Customize sorting, visibility, and item details to fit your unique style.'
            Icon={SlidersIcon}
          />

          <FeatureCard
            title='Track Purchased Items'
            description='Mark items as purchased and keep a complete history of fulfilled wishes.'
            Icon={CheckBoxIcon}
          />

          <FeatureCard
            title='Smart Tagging System'
            description='Add your own tags to items and filter across wishlists for easy organization and discovery.'
            Icon={HashtagIcon}
          />
        </div>
      </Container>
    </section>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
};

function FeatureCard({ title, description, Icon }: FeatureCardProps): JSX.Element {
  return (
    <div className='card'>
      <div className='card-header'>
        <div>
          <Icon className='w-3 h-3 text-cta' />
        </div>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
    </div>
  );
}
