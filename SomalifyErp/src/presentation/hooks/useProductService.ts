/**
 * Presentation Hook: useProductService
 * Provides easy access to ProductService in React components
 */
import { useMemo } from 'react';
import { ProductService } from '../../application/services/ProductService';
import { ProductRepository } from '../../infrastructure/api/ProductRepository';

export const useProductService = () => {
  const productService = useMemo(() => {
    const repository = new ProductRepository();
    return new ProductService(repository);
  }, []);

  return productService;
};
