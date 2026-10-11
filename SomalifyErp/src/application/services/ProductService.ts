/**
 * Application Service: Product
 * Contains business logic for product operations
 */
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product, CreateProductDTO, UpdateProductDTO } from '../../domain/entities/Product';

export class ProductService {
  constructor(private repository: IProductRepository) {}

  async getAllProducts(page: number = 1, pageSize: number = 20) {
    return await this.repository.getAll({ page, pageSize });
  }

  async getProductById(id: number): Promise<Product> {
    return await this.repository.getById(id);
  }

  async createProducts(products: CreateProductDTO[]): Promise<void> {
    // Business logic validation can go here
    if (products.length === 0) {
      throw new Error('At least one product is required');
    }
    
    products.forEach((product) => {
      if (!product.product_name || !product.product_code) {
        throw new Error('Product name and code are required');
      }
    });

    await this.repository.create(products);
  }

  async updateProduct(product: UpdateProductDTO): Promise<void> {
    if (!product.product_id) {
      throw new Error('Product ID is required for update');
    }
    await this.repository.update(product);
  }

  async deleteProduct(id: number): Promise<void> {
    if (!id) {
      throw new Error('Product ID is required for deletion');
    }
    await this.repository.delete(id);
  }
}
