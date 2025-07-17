import { checkHealth } from '../../src/services/api';
import { API_URL } from '../../src/config/constants';

// Mock fetch globalement
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  it('should check health endpoint successfully', async () => {
    const mockResponse = { status: 'healthy', timestamp: '2024-01-01T00:00:00Z' };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await checkHealth();

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/health`);
    expect(result.status).toBe('healthy');
    expect(result.timestamp).toBe('2024-01-01T00:00:00Z');
  });

  it('should handle API errors', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    await expect(checkHealth()).rejects.toThrow('HTTP error! status: 500');
  });

  it('should handle network errors', async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(checkHealth()).rejects.toThrow('Failed to check health: Error: Network error');
  });
});
