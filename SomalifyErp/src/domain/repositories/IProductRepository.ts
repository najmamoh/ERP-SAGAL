/**
 * Repository Interface: Product
 * Defines the contract for product data access
 */
import { Product, CreateProductDTO, UpdateProductDTO } from '../entities/Product';

export interface IProductRepository {
  getAll(params: { page: number; pageSize: number }): Promise<{ data: Product[]; total: number }>;
  getById(id: number): Promise<Product>;
  create(data: CreateProductDTO[]): Promise<void>;
  update(data: UpdateProductDTO): Promise<void>;
  delete(id: number): Promise<void>;
}
