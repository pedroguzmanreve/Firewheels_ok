export interface Plan {
  id: string;
  name: string;
  weekly_classes: number;
  price: number;
  created_at: string;
}

export interface AttachedDocument {
  id: string;
  name: string;
  type: 'identity_doc' | 'medical_cert' | 'guardian_id' | 'payment_receipt' | 'other';
  label: string;
  file_url: string; // Base64 data URL or storage URL
  file_name: string;
  file_size?: number; // bytes
  mime_type?: string;
  uploaded_at: string;
}

export interface Student {
  id: string;
  photo_url?: string;
  full_name: string;
  birth_date: string;
  document_number: string; // T.I, Registro Civil, C.C.
  phone: string;
  address: string;
  neighborhood: string;
  medical_entity: string; // EPS / Seguro Médico

  // Madre
  mother_name: string;
  mother_company: string;
  mother_company_phone: string;
  mother_landline: string;
  mother_cellphone: string;

  // Padre
  father_name: string;
  father_company: string;
  father_company_phone: string;
  father_landline: string;
  father_cellphone: string;

  // Acudiente / Responsable
  guardian_name: string;
  guardian_company: string;
  guardian_phone: string;
  guardian_landline: string;
  guardian_cellphone: string;

  // Términos y firma
  accepts_terms: boolean;
  guardian_signature?: string; // Data URL or text
  guardian_id_number: string; // Cédula del acudiente

  // Documentos y anexos cargados
  attached_documents?: AttachedDocument[];

  status: 'active' | 'inactive';
  plan_id: string;
  enrollment_fee_paid: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_method: 'transfer' | 'cash';
  payment_date: string;
  period_month: string; // e.g. "08" or "Agosto 2026"
  period_year: number;
  notes?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused';
  notes?: string;
  created_at: string;
}

export interface ClubInfo {
  name: string;
  subtitle: string;
  enrollment_fee: number;
  phone: string;
  address: string;
  bank_details: string;
  logo_url?: string;
}
