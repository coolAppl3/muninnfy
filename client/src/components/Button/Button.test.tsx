import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Locator, userEvent } from 'vitest/browser';
import Button from './Button';

describe('Button', () => {
  it('renders text', async () => {
    const { getByRole } = await render(<Button>someText</Button>);

    const btn: Locator = getByRole('button', { name: 'someText' });
    await expect.element(btn).toBeInTheDocument();
  });

  it('renders a react node', async () => {
    const { getByText } = await render(
      <Button>
        <span>someText</span>
      </Button>
    );

    const span: Locator = getByText('someText');
    await expect.element(span).toBeInTheDocument();
  });

  it('includes custom class names', async () => {
    const { getByRole } = await render(<Button className='someClass'>someText</Button>);

    const btn: Locator = getByRole('button');
    await expect.element(btn).toHaveClass('someClass');
  });

  it('should render a non-disabled button by default', async () => {
    const { getByRole } = await render(<Button>someText</Button>);

    const btn: Locator = getByRole('button');
    await expect.element(btn).not.toBeDisabled();
  });

  it('should render a disabled button if disabled prop is set to true', async () => {
    const { getByRole } = await render(<Button disabled={true}>someText</Button>);

    const btn: Locator = getByRole('button');
    await expect.element(btn).toBeDisabled();
  });

  it('should include include different class names depending on whether or not it is disabled', async () => {
    const { getByRole } = await render(
      <>
        <Button>someText1</Button>
        <Button disabled={true}>someText2</Button>
      </>
    );

    const btn1: Locator = getByRole('button', { name: 'someText1' });
    const btn2: Locator = getByRole('button', { name: 'someText2' });

    await expect.element(btn1).toHaveClass('cursor-pointer hover:brightness-75');
    await expect.element(btn2).toHaveClass('opacity-25 cursor-default hover:brightness-100');
  });

  it('should be of type button by default', async () => {
    const { getByRole } = await render(<Button>someText</Button>);

    const btn: Locator = getByRole('button');
    await expect.element(btn).toHaveAttribute('type', 'button');
  });

  it('should be of type submit if the isSubmitBtn prop is true', async () => {
    const { getByRole } = await render(<Button isSubmitBtn={true}>someText</Button>);

    const btn: Locator = getByRole('button');
    await expect.element(btn).toHaveAttribute('type', 'submit');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const { getByRole } = await render(<Button onClick={onClick}>someText</Button>);

    const btn: Locator = getByRole('button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
