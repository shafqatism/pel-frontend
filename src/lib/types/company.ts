import { Attachment } from "./common";

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  contactPerson?: string;
  industry?: string;
  category: "vendor" | "client" | "partner";
  status: "active" | "inactive";
  logoUrl?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  registrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  contactPerson?: string;
  industry?: string;
  category?: string;
  status?: string;
  logoUrl?: string;
  attachments?: Attachment[];
}
