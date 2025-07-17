import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WelcomeScreen } from '../../src/components/WelcomeScreen';

describe('WelcomeScreen', () => {
  it('should render welcome text', () => {
    render(<WelcomeScreen />);
    
    const welcomeText = screen.getByTestId('welcome-text');
    expect(welcomeText).toBeTruthy();
    expect(welcomeText).toHaveTextContent('Bienvenue sur AfriStocks');
  });

  it('should render subtitle', () => {
    render(<WelcomeScreen />);
    
    const subtitle = screen.getByTestId('subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle).toHaveTextContent("Votre plateforme d'investissement");
  });
});
