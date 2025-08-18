// __tests__/components/GlassCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/ui/GlassCard';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    render(
      <GlassCard>
        <p>Test content</p>
      </GlassCard>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('applies hover effects', () => {
    const { container } = render(
      <GlassCard glowColor="emerald">
        <p>Hover test</p>
      </GlassCard>
    );
    
    const card = container.firstChild;
    expect(card).toHaveClass('group');
  });
});