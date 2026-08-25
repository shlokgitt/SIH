// API utility functions for backend integration

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Advisory endpoints
  advisory: {
    getDosage: async (orderId: string, cropAreaAcres: number) => {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_BASE_URL}/advisory/${orderId}?cropAreaAcres=${cropAreaAcres}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    },
  },

  // Marketplace endpoints
  marketplace: {
    getBatches: async () => {
      const response = await fetch(`${API_BASE_URL}/marketplace/`);

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      return response.json();
    },

    getBatchDetail: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/marketplace/${id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch batch details');
      }

      return response.json();
    },
  },

  // Order endpoints
  orders: {
    createOrder: async (orderData: Record<string, unknown>) => {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || 'Failed to create order'
        );
      }

      return response.json();
    },
  },

  // Batch endpoints
  batches: {
    getCertificate: async (batchId: string) => {
      const response = await fetch(
        `${API_BASE_URL}/batches/${batchId}/certificate`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }

      return response.json();
    },
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || 'Login failed'
        );
      }

      return response.json();
    },

    register: async (userData: Record<string, unknown>) => {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || 'Registration failed'
        );
      }

      return response.json();
    },
  },
};