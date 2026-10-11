/**
 * Repository Interface: Vendor
 * Defines the contract for vendor data access
 */
import { Vendor, CreateVendorDTO, UpdateVendorDTO } from '../entities/Vendor';

export interface IVendorRepository {
  getAll(params: { page: number; pageSize: number }): Promise<{ data: Vendor[]; total: number }>;
  getById(id: number): Promise<Vendor>;
  create(data: CreateVendorDTO[]): Promise<void>;
  update(data: UpdateVendorDTO): Promise<void>;
  delete(id: number): Promise<void>;
}
