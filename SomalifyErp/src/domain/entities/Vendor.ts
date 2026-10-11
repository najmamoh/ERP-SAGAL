/**
 * Domain Entity: Vendor
 * Represents the core vendor business entity
 */
export interface Vendor {
  vendor_id: number;
  vendor_name: string;
  vendor_address: string;
  vendor_email: string;
  vendor_phone: string;
  company_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVendorDTO {
  vendor_name: string;
  vendor_address: string;
  vendor_email: string;
  vendor_phone: string;
  company_id?: string | null; // Optional for admin users
}

export interface UpdateVendorDTO extends Partial<CreateVendorDTO> {
  vendor_id: number;
}
