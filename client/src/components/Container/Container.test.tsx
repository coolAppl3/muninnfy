import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import Container from './Container';
import { Locator } from 'vitest/browser';

describe('Container', () => {
  it('should render a react node', async () => {
    const { getByText } = await render(
      <Container>
        <span>someText</span>
      </Container>
    );

    const span: Locator = getByText('someText');
    await expect.element(span).toBeInTheDocument();
  });

  it('includes custom class names', async () => {
    const { getByText } = await render(<Container className='someClass'>someText</Container>);

    const container: Locator = getByText('someText');
    await expect.element(container).toHaveClass('someClass');
  });
});
