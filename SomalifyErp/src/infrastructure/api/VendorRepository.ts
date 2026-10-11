/**
 * Infrastructure: Vendor Repository Implementation
 * Implements IVendorRepository using HTTP API
 */
import { IVendorRepository } from '../../domain/repositories/IVendorRepository';
import { Vendor, CreateVendorDTO, UpdateVendorDTO } from '../../domain/entities/Vendor';
import api from '../http/api';
import { Url } from '../../shared/constants';

export class VendorRepository implements IVendorRepository {
  async getAll(params: { page: number; pageSize: number }): Promise<{ data: Vendor[]; total: number }> {
    const response = await api.get(`${Url}/vendors`, {
      params: { page: params.page, pageSize: params.pageSize },
    });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  }

  async getById(id: number): Promise<Vendor> {
    const response = await api.get(`${Url}/vendors/${id}`);
    return response.data;
  }

  async create(data: CreateVendorDTO[]): Promise<void> {
    await api.post(`${Url}/vendors`, data);
  }

  async update(data: UpdateVendorDTO): Promise<void> {
    await api.put(`${Url}/vendors/${data.vendor_id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${Url}/vendors/${id}`);
  }
}
