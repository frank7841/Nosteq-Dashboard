import { api } from './api';
import type { User } from '../types';

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },
};
