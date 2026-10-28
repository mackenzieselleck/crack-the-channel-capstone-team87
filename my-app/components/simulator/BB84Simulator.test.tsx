// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BB84Simulator from './BB84Simulator';

describe('BB84 Simulator', () => {
  it('shows the role selection screen when opened', () => {
    render(<BB84Simulator />);

    expect(
      screen.getByRole('heading', { name: 'Choose your role' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Play as Alice/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Play as Bob/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Play as Eve/i })
    ).toBeInTheDocument();
  });
});
