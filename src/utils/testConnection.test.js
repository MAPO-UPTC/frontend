import axios from 'axios';
import { testBackendConnection, testSpecificEndpoint } from './testConnection';

jest.mock('axios');

describe('Pruebas simuladas de conectividad con mocks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('debe pasar todas las pruebas de conexión cuando las respuestas son correctas', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { status: 'ok' } }) // health
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] }) // productos
      .mockResolvedValueOnce({ data: { info: { title: 'MAPO API', version: '1.0' } } }); // openapi

    const result = await testBackendConnection();
    expect(result).toBe(true);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  test('debe retornar false si ocurre un error en health check', async () => {
    axios.get.mockRejectedValueOnce(new Error('Fallo conexión'));
    const result = await testBackendConnection();
    expect(result).toBe(false);
  });

  test('debe retornar datos correctos cuando el endpoint responde bien', async () => {
    const mockData = { id: 1, name: 'Producto Test' };
    axios.request.mockResolvedValueOnce({ data: mockData });

    const result = await testSpecificEndpoint('/products/1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });

  test('debe retornar error cuando el endpoint falla', async () => {
    axios.request.mockRejectedValueOnce({ response: { status: 404, data: 'No encontrado' } });

    const result = await testSpecificEndpoint('/products/999');
    expect(result.success).toBe(false);
    expect(result.error).toBe('No encontrado');
  });
});
