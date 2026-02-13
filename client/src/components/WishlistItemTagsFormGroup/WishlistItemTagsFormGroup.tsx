import { ChangeEvent, JSX, KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../../utils/constants/wishlistItemConstants';
import usePopupMessage from '../../hooks/usePopupMessage';

type WishlistItemTagsFormGroupProps = {
  tagsSet: Set<string>;
  setTagsSet: (newSet: Set<string>) => void;
  label: string;
};

export default function WishlistItemTagsFormGroup({ tagsSet, setTagsSet, label }: WishlistItemTagsFormGroupProps): JSX.Element {
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { displayPopupMessage } = usePopupMessage();

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const newValue: string = e.target.value;

    const containsWhitespace: boolean = /\s/.test(newValue);
    if (containsWhitespace) {
      return;
    }

    setValue(newValue);
    newValue === '' || setErrorMessage(validateItemTag(newValue));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      e.preventDefault();
    }

    const value: string = e.currentTarget.value;

    if (e.key === 'Backspace' && value === '') {
      setTagsSet(new Set<string>([...tagsSet].slice(0, -1)));
      return;
    }

    if ((e.key === ' ' || e.key === 'Enter') && !validateItemTag(value)) {
      if (tagsSet.size >= WISHLIST_ITEM_TAGS_LIMIT) {
        displayPopupMessage('Tags limit reached.', 'error');
        return;
      }

      setTagsSet(new Set<string>(tagsSet).add(value.toLowerCase()));
      setValue('');
    }
  }

  function validateItemTag(value: string): string | null {
    const regex: RegExp = /^[A-Za-z0-9_]{1,50}$/;

    if (length > 50) {
      return 'Tag must not exceed 50 characters.';
    }

    if (!regex.test(value)) {
      return 'Only English letters, numbers, and underscores are allowed.';
    }

    return null;
  }

  return (
    <div className='flex flex-col justify-center items-start gap-[6px] cursor-text'>
      <label
        htmlFor='item-tags'
        className='text-sm font-medium text-title'
      >
        {label}
      </label>

      <div
        className={`w-full min-h-4 p-[8px] rounded border-1 focus:border-cta outline-0 text-description font-medium md:text-sm transition-colors ${
          inputFocused ? 'border-cta' : 'border-description/75'
        }`}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          if (!(e.target instanceof HTMLSpanElement)) {
            inputRef.current?.focus();
            return;
          }

          const tag: string = e.target.textContent;
          const newSet = new Set<string>(tagsSet);

          newSet.delete(tag.toLowerCase());
          setTagsSet(newSet);
        }}
      >
        {[...tagsSet].map((tag: string) => (
          <span
            key={tag}
            title='Remove tag'
            aria-label='Remove tag'
            className='inline-block p-[4px] m-[2px] bg-light text-dark rounded leading-[1] break-words max-w-[20rem] transition-colors hover:bg-danger cursor-pointer'
          >
            {tag}
          </span>
        ))}

        <input
          name='item-tags'
          id='item-tags'
          autoComplete='off'
          value={value}
          ref={inputRef}
          size={value.length || 1}
          onFocus={() => setInputFocused(true)}
          onBlur={() => {
            setValue('');
            setErrorMessage(null);

            setInputFocused(false);
          }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className='outline-none h-fit max-w-fit inline-block ml-[2px] text-sm'
        />
      </div>

      <span className={`text-[12px] font-medium text-danger leading-[1.2] break-words ${errorMessage ? 'block' : 'hidden'}`}>
        {errorMessage}
      </span>
    </div>
  );
}
