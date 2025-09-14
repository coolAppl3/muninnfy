import { ChangeEvent, Dispatch, JSX, KeyboardEvent, MouseEvent, SetStateAction, useRef, useState } from 'react';
import '../../../components/FormGroups/FormGroups.css';
import { WISHLIST_ITEM_TAGS_LIMIT } from '../../../utils/constants/wishlistItemConstants';
import usePopupMessage from '../../../hooks/usePopupMessage';

export default function WishlistItemTagsFormGroup({
  itemTags,
  setItemTags,
}: {
  itemTags: Set<string>;
  setItemTags: Dispatch<SetStateAction<Set<string>>>;
}): JSX.Element {
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
      nextBackspaceRemovesTag ? setItemTags((prev) => new Set([...prev].slice(0, -1))) : setNextBackspaceRemovesTag(true);
      return;
    }

    if (e.key === ' ' && !validateItemTag(value)) {
      if (itemTags.size >= WISHLIST_ITEM_TAGS_LIMIT) {
        displayPopupMessage('Item tags limit reached.', 'error');
        return;
      }

      setItemTags((prev) => new Set([...prev, value.toLowerCase()]));
      setValue('');

      setNextBackspaceRemovesTag(true);
    }
  }

  function validateItemTag(value: string): string | null {
    const regex: RegExp = /^[A-Za-z0-9_]{1,50}$/;

    if (!regex.test(value)) {
      return 'Only English letters, numbers, and underscores are allowed.';
    }

    return null;
  }

  return (
    <div className={`form-group tags-form-group ${errorMessage ? 'error' : ''}`}>
      <label htmlFor='item-tags'>Tags (optional)</label>

      <div
        className={inputFocused ? 'focused' : ''}
        onClick={(e: MouseEvent<HTMLDivElement>) => {
          if (!(e.target instanceof HTMLSpanElement)) {
            inputRef.current?.focus();
            return;
          }

          const tag: string = e.target.textContent;

          setItemTags((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tag.toLocaleLowerCase());

            return newSet;
          });
        }}
      >
        <Tags itemTags={itemTags} />

        <input
          name='item-tags'
          id='item-tags'
          autoComplete='off'
          value={value}
          ref={inputRef}
          size={value.length || 1}
          onFocus={() => setInputFocused(true)}
          onBlur={() => {
            setInputFocused(false);
            setValue('');
            setNextBackspaceRemovesTag(true);
          }}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <span className='error-span'>{errorMessage}</span>
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
