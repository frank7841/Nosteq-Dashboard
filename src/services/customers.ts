import { api } from './api';
import type { Customer } from '../types';

export interface CreateCustomerDto {
  name: string;
  phoneNumber: string;
  email?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<Customer[]>('/customers');
    return res.data;
  },

  getOne: async (id: number): Promise<Customer> => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
  },

  create: async (data: CreateCustomerDto): Promise<Customer> => {
    const res = await api.post<Customer>('/customers', data);
    return res.data;
  },

  update: async (id: number, data: UpdateCustomerDto): Promise<Customer> => {
    const res = await api.patch<Customer>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
