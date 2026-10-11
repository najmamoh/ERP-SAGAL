/**
 * Domain Entity: Product
 * Represents the core product business entity
 */
export interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  product_cost: string;
  product_price: string;
  product_alert_number: number;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDTO {
  product_code: string;
  product_name: string;
  product_cost: string;
  product_price: string;
  product_alert_number: number;
  company_id: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  product_id: number;
}
