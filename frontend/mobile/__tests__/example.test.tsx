import React from 'react';
import { render, screen } from '@testing-library/react-native';

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should render a component', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });
});
