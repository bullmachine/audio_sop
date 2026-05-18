import { apiRequest } from './axios';
import type { PaginationParams, PaginatedResponse } from '../types/common';

export class GenericCrudService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    return apiRequest.get(this.endpoint, { params });
  }

  async getById(id: string): Promise<T> {
    return apiRequest.get(`${this.endpoint}/${id}`);
  }

  async create(data: Partial<T>): Promise<T> {
    return apiRequest.post(this.endpoint, data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return apiRequest.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiRequest.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    return apiRequest.get(`${this.endpoint}/search`, {
      params: { ...params, search: query }
    });
  }
}
