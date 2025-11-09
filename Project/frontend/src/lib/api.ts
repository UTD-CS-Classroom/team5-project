import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      
      // Only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface Business {
  id: number;
  email: string;
  business_name: string;
  phone: string;
  address: string;
  specialty: string;
  description: string;
  profile_image?: string;
  cover_image?: string;
  created_at: string;
}

export interface Service {
  id: number;
  business_id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface TimeSlot {
  id: number;
  business_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  appointment_id: string;
  customer_id: number;
  business_id: number;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  business_note: string | null;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_type: string;
  user_id: number;
}

export interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
}

// Authentication APIs
export const customerRegister = (data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}) => api.post<Customer>('/auth/customer/register', data);

export const customerLogin = (data: { email: string; password: string }) =>
  api.post<LoginResponse>('/auth/customer/login', data);

export const businessRegister = (data: {
  email: string;
  password: string;
  business_name: string;
  phone?: string;
  address?: string;
  specialty?: string;
  description?: string;
}) => api.post<Business>('/auth/business/register', data);

export const businessLogin = (data: { email: string; password: string }) =>
  api.post<LoginResponse>('/auth/business/login', data);

// Public APIs
export const searchBusinesses = (params?: {
  specialty?: string;
  location?: string;
}) => api.get<Business[]>('/public/businesses', { params });

export const getBusinessById = (id: number) =>
  api.get<Business>(`/public/businesses/${id}`);

export const getBusinessServices = (businessId: number) =>
  api.get<Service[]>(`/public/businesses/${businessId}/services`);

export const getAvailableTimeSlots = (businessId: number, date: string) =>
  api.get<TimeSlot[]>(`/public/businesses/${businessId}/slots`, { params: { date } });

export const getBookedSlots = (businessId: number, date: string) =>
  api.get<{ booked_slots: string[] }>(`/public/businesses/${businessId}/booked-slots`, { params: { date } });

// Customer APIs
export const createAppointment = (data: {
  business_id: number;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
}) => api.post<Appointment>('/customer/appointments', data);

export const getCustomerAppointments = () =>
  api.get<Appointment[]>('/customer/appointments');

export const cancelAppointment = (appointmentId: number) =>
  api.delete(`/customer/appointments/${appointmentId}`);

export const getCustomerProfile = () => api.get<Customer>('/customer/me');

// Business APIs
export const getBusinessAppointments = () =>
  api.get<Appointment[]>('/business/appointments');

export const updateAppointmentStatus = (appointmentId: number, status: string) =>
  api.patch(`/business/appointments/${appointmentId}/status`, { status });

export const getBusinessProfile = () => api.get<Business>('/business/me');

// File Upload APIs
export const uploadBusinessProfileImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ message: string; filename: string; url: string }>(
    '/upload/business/profile-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const uploadBusinessCoverImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<{ message: string; filename: string; url: string }>(
    '/upload/business/cover-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const deleteBusinessProfileImage = () =>
  api.delete('/upload/business/profile-image');

export const deleteBusinessCoverImage = () =>
  api.delete('/upload/business/cover-image');

export const getUploadedFileUrl = (filename: string) =>
  `${API_URL}/upload/files/${filename}`;

export default api;
