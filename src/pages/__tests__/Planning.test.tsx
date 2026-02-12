import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Planning } from '../Planning';

const { mockGet, mockPost } = vi.hoisted(() => {
  return {
    mockGet: vi.fn(),
    mockPost: vi.fn(),
  }
});

vi.mock('../../services/api', () => ({
  api: {
    get: mockGet,
    post: mockPost
  }
}));

describe('Planning Component', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGet.mockResolvedValue({ data: [] });
  });

  it('deve renderizar o titulo da pagina', async () => {
    render(<Planning />);
    
    await waitFor(() => {
        const titleElement = screen.getByText(/Planejamento de Produção/i);
        expect(titleElement).toBeInTheDocument();
    });
  });

  it('deve mostrar a area de sugestao inteligente', async () => {
    render(<Planning />);
    
    await waitFor(() => {
        const suggestionText = screen.getByText(/Sugestão Inteligente/i);
        expect(suggestionText).toBeInTheDocument();
    });
  });

  it('deve mostrar inputs de calculo manual', async () => {
    render(<Planning />);
    
    await waitFor(() => {
        const button = screen.getByRole('button', { name: /Produzir|Calcular/i });
        expect(button).toBeInTheDocument();
    });
  });
});