import { apiService } from '../apiService';

// RFQ (Request for Quote) Service
export const rfqService = {
  // Create new RFQ (buyer only)
  createRFQ: (data: {
    chemicalName: string;
    CASNumber?: string;
    quantity: number;
    unit: string;
    targetPrice?: number;
    deliveryCity: string;
    deliveryCountry?: string;
    requiredDeliveryDate?: string;
    specifications?: string;
    paymentTerms?: string;
  }) => apiService.post('/api/marketplace/rfq', data),

  // Get RFQ marketplace (for suppliers)
  getRFQMarketplace: (params?: {
    status?: string;
    chemicalName?: string;
    deliveryCity?: string;
    page?: number;
    limit?: number;
  }) => apiService.get('/api/marketplace/rfq/marketplace', { params }),

  // Get buyer's RFQs
  getBuyerRFQs: (params?: { status?: string; page?: number; limit?: number }) =>
    apiService.get('/api/marketplace/rfq/my-rfqs', { params }),

  // Get supplier's quotes
  getSupplierQuotes: () => apiService.get('/api/marketplace/rfq/my-quotes'),

  // Get single RFQ by ID
  getRFQById: (id: string) => apiService.get(`/api/marketplace/rfq/${id}`),

  // Submit quote (supplier only)
  submitQuote: (rfqId: string, data: {
    pricePerUnit: number;
    totalPrice: number;
    deliveryDays: number;
    validityDays: number;
    notes?: string;
  }) => apiService.post(`/api/marketplace/rfq/${rfqId}/quote`, data),

  // Accept quote (buyer only)
  acceptQuote: (rfqId: string, quoteId: string) =>
    apiService.post(`/api/marketplace/rfq/${rfqId}/accept/${quoteId}`),

  // Close RFQ (buyer only)
  closeRFQ: (id: string) => apiService.patch(`/api/marketplace/rfq/${id}/close`),
};

// Group Buy Service
export const groupBuyService = {
  // Create group buy (supplier/admin only)
  createGroupBuy: (data: {
    chemicalName: string;
    CASNumber?: string;
    targetQuantity: number;
    unit: string;
    pricePerUnit: number;
    originalPricePerUnit?: number;
    minimumParticipation?: number;
    deadline: string;
    deliveryCity: string;
    deliveryCountry?: string;
    estimatedDeliveryDays?: number;
    paymentTerms?: string;
    specifications?: string;
  }) => apiService.post('/api/marketplace/groupbuy', data),

  // Get active group buys
  getGroupBuyList: (params?: {
    status?: 'Active' | 'Filled' | 'Cancelled' | 'Completed';
    chemicalName?: string;
    supplierId?: string;
    page?: number;
    limit?: number;
  }) => apiService.get('/api/marketplace/groupbuy', { params }),

  // Get single group buy by ID
  getGroupBuyById: (id: string) => apiService.get(`/api/marketplace/groupbuy/${id}`),

  // Join group buy (buyer only)
  joinGroupBuy: (id: string, data: {
    quantity: number;
    deliveryAddressId: string;
    notes?: string;
  }) => apiService.post(`/api/marketplace/groupbuy/${id}/join`, data),

  // Get buyer's participations
  getBuyerParticipations: () => apiService.get('/api/marketplace/groupbuy/my-participations'),

  // Get supplier's group buys
  getSupplierGroupBuys: () => apiService.get('/api/marketplace/groupbuy/my-campaigns'),

  // Cancel group buy (admin only)
  cancelGroupBuy: (id: string) => apiService.patch(`/api/marketplace/groupbuy/${id}/cancel`),
};

// Chemical Database Service
export const chemicalService = {
  // Get all chemicals (public)
  getChemicals: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    application?: string;
  }) => apiService.get('/api/marketplace/chemicals', { params }),

  // Get chemical by slug
  getChemicalBySlug: (slug: string) => apiService.get(`/api/marketplace/chemicals/${slug}`),

  // Search by application (public)
  searchByApplication: (application: string) =>
    apiService.get('/api/marketplace/chemicals/search', { params: { application } }),

  // Get related chemicals
  getRelatedChemicals: (id: string) => apiService.get(`/api/marketplace/chemicals/${id}/related`),

  // Create chemical (admin only)
  createChemical: (data: {
    chemicalName: string;
    CASNumber?: string;
    formula?: string;
    description?: string;
    category?: string;
    applications?: string[];
    properties?: Record<string, any>;
    safetyInfo?: Record<string, any>;
  }) => apiService.post('/api/marketplace/chemicals', data),

  // Update chemical (admin only)
  updateChemical: (id: string, data: Partial<{
    chemicalName: string;
    CASNumber?: string;
    formula?: string;
    description?: string;
    category?: string;
    applications?: string[];
    properties?: Record<string, any>;
    safetyInfo?: Record<string, any>;
  }>) => apiService.patch(`/api/marketplace/chemicals/${id}`, data),

  // Delete chemical (admin only)
  deleteChemical: (id: string) => apiService.delete(`/api/marketplace/chemicals/${id}`),
};

// Export combined marketplace service
export const marketplaceService = {
  rfq: rfqService,
  groupBuy: groupBuyService,
  chemical: chemicalService,
};

export default marketplaceService;
