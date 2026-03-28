import apiServices from './api';

const { api } = apiServices;

export const logisticsService = {
  // Subscription Services
  subscriptions: {
    getStatus: () => api.get('/api/subscriptions/status'),
    uploadProof: (data: { method: string, transactionId: string, url: string }) => 
      api.post('/api/subscriptions/upload-proof', data),
    getPending: () => api.get('/api/subscriptions/admin/pending'),
    approve: (id: string) => api.patch(`/api/subscriptions/approve/${id}`),
  },

  // Delivery Services
  deliveries: {
    createRequest: (data: any) => api.post('/api/deliveries/request', data),
    getNearby: (lat: number, lng: number, radius?: number) => 
      api.get(`/api/deliveries/nearby?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ''}`),
    getPricing: (params: { pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number }) =>
      api.get('/api/deliveries/pricing', { params }),
    apply: (id: string, price?: number) => api.post(`/api/deliveries/${id}/apply`, { price }),
    complete: (id: string, code: string) => api.post(`/api/deliveries/${id}/complete`, { code }),
    getSellerDeliveries: () => api.get('/api/deliveries/seller'),
    getDriverDeliveries: () => api.get('/api/deliveries/driver'),
    selectDriver: (id: string, offerId: string) => api.patch(`/api/deliveries/${id}/select-driver`, { offerId }),
    raiseDispute: (id: string, data: { reason: string, description: string, evidence?: string[] }) =>
      api.post(`/api/disputes/${id}/dispute`, data),
  },
  disputes: {
    getAll: () => api.get('/api/disputes/admin/all'),
    resolve: (id: string, data: { outcome: string, notes: string }) =>
      api.patch(`/api/disputes/admin/${id}/resolve`, data),
  },
  reports: {
    exportLogistics: () => api.get('/api/reports/logistics/export', { responseType: 'blob' }),
  },
  users: {
    updateDriverProfile: (data: any) => api.patch('/api/users/driver/profile', data),
    verifyDriver: (id: string, isVerified: boolean) => api.patch(`/api/users/admin/verify-driver/${id}`, { isVerified }),
    getDrivers: () => api.get('/api/users/admin/users', { params: { role: 'delivery' } }),
  },
  chat: {
    getByDelivery: (deliveryId: string) => api.get(`/api/logistics-chat/${deliveryId}`),
    sendMessage: (deliveryId: string, content: string, attachments?: string[]) => 
      api.post(`/api/logistics-chat/${deliveryId}/messages`, { content, attachments }),
  }
};
