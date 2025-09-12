import { ChangeEvent, Dispatch, JSX, KeyboardEvent, MouseEvent, Ref, SetStateAction, useRef, useState } from 'react';
import '../../../../components/FormGroups/FormGroups.css';

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

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    const newValue: string = e.target.value;

    if (!/\s/.test(newValue)) {
      setValue(newValue);
      // TODO: validate

      setNextBackspaceRemovesTag(false);
      return;
    }

    if (newValue.trim() === '') {
      return;
    }

    setItemTags((prev) => new Set([...prev, value]));
    setValue('');

    setNextBackspaceRemovesTag(true);
  }

  function handleKeyUp(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace' && e.currentTarget.value === '') {
      nextBackspaceRemovesTag ? setItemTags((prev) => new Set([...prev].slice(0, -1))) : setNextBackspaceRemovesTag(true);
    }
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
            newSet.delete(tag);

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
          onBlur={() => setInputFocused(false)}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
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
