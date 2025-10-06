import { ChangeEvent, Dispatch, JSX, KeyboardEvent, MouseEvent, SetStateAction, useRef, useState } from 'react';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../../utils/constants/wishlistItemConstants';
import usePopupMessage from '../../hooks/usePopupMessage';

type WishlistItemTagsFormGroupProps = {
  itemTags: Set<string>;
  setItemTags: Dispatch<SetStateAction<Set<string>>>;
  label: string;
};

export default function WishlistItemTagsFormGroup({ itemTags, setItemTags, label }: WishlistItemTagsFormGroupProps): JSX.Element {
  const [value, setValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nextBackspaceRemovesTag, setNextBackspaceRemovesTag] = useState<boolean>(false);
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

    setNextBackspaceRemovesTag(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    const value: string = e.currentTarget.value;

    if (e.key === 'Backspace' && value === '') {
      nextBackspaceRemovesTag ? setItemTags((prev) => new Set<string>([...prev].slice(0, -1))) : setNextBackspaceRemovesTag(true);
      return;
    }

    if (e.key === ' ' && !validateItemTag(value)) {
      if (itemTags.size >= WISHLIST_ITEM_TAGS_LIMIT) {
        displayPopupMessage('Item tags limit reached.', 'error');
        return;
      }

      setItemTags((prev) => new Set(prev).add(value.toLowerCase()));
      setValue('');

      setNextBackspaceRemovesTag(true);
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

          setItemTags((prev) => {
            const newSet = new Set<string>(prev);
            newSet.delete(tag.toLowerCase());

            return newSet;
          });
        }}
      >
        {[...itemTags].map((tag: string) => (
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
            setNextBackspaceRemovesTag(true);
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

function Tags({ itemTags }: { itemTags: Set<string> }): JSX.Element {
  return (
    <>
      {[...itemTags].map((tag: string) => (
        <span
          key={tag}
          className='tag'
          title='Remove tag'
        >
          {tag}
        </span>
      ))}
    </>
  );
}
