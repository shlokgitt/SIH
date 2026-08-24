// API utility functions for backend integration

const API_BASE_URL = "http://192.168.1.15:5000/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const parseResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  // ==========================================
  // ADVISORY ENDPOINTS
  // ==========================================

  advisory: {
    getDosage: async (
      orderId: string,
      cropAreaAcres: number
    ) => {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/advisory/${orderId}?cropAreaAcres=${cropAreaAcres}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      return parseResponse(response);
    },
  },

  // ==========================================
  // MARKETPLACE ENDPOINTS
  // ==========================================

  marketplace: {
    getBatches: async () => {
      const response = await fetch(
        `${API_BASE_URL}/marketplace/`
      );

      return parseResponse(response);
    },

    getBatchDetail: async (id: string) => {
      const response = await fetch(
        `${API_BASE_URL}/marketplace/${id}`
      );

      return parseResponse(response);
    },
  },

  // ==========================================
  // ORDER ENDPOINTS
  // ==========================================

  orders: {
    createOrder: async (
      orderData: Record<string, unknown>
    ) => {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify(orderData),
        }
      );

      return parseResponse(response);
    },
  },

  // ==========================================
  // BATCH / CERTIFICATION ENDPOINTS
  // ==========================================

  batches: {
    createBatch: async (
      batchData: Record<string, unknown>
    ) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication required. Please login first."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/batches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(batchData),
        }
      );

      return parseResponse(response);
    },

    // IMPORTANT:
    // This expects the MongoDB batchCode,
    // NOT the MongoDB ObjectId.
    //
    // Example:
    // BATCH-FOM-2026-001
    //
    // GET:
    // /api/batches/BATCH-FOM-2026-001/certificate
    getCertificate: async (
      batchCode: string
    ) => {
      if (!batchCode) {
        throw new Error(
          "Batch code is required."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/batches/${encodeURIComponent(
          batchCode
        )}/certificate`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return parseResponse(response);
    },
  },

  // ==========================================
  // AUTH ENDPOINTS
  // ==========================================

  auth: {
    login: async (
      email: string,
      password: string
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await parseResponse(response);

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      return data;
    },

    register: async (
      userData: Record<string, unknown>
    ) => {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await parseResponse(response);

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      return data;
    },
  },
};