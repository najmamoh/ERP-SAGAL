/**
 * Infrastructure: Product Repository Implementation
 * Implements IProductRepository using HTTP API
 */
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product, CreateProductDTO, UpdateProductDTO } from '../../domain/entities/Product';
import api from '../http/api';
import { Url } from '../../shared/constants';

export class ProductRepository implements IProductRepository {
  async getAll(params: { page: number; pageSize: number }): Promise<{ data: Product[]; total: number }> {
    const response = await api.get(`${Url}/products`, {
      params: { page: params.page, pageSize: params.pageSize },
    });
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
    };
  }

  async getById(id: number): Promise<Product> {
    const response = await api.get(`${Url}/products/${id}`);
    return response.data;
  }

  async create(data: CreateProductDTO[]): Promise<void> {
    await api.post(`${Url}/products`, data);
  }

  async update(data: UpdateProductDTO): Promise<void> {
    await api.put(`${Url}/products/${data.product_id}`, data);
  }

  async delete(id: number): Promise<void> {
    await api.delete(`${Url}/products/${id}`);
  }
}
