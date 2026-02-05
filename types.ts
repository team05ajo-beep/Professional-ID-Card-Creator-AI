
export interface IDCardData {
  fullName: string;
  role: string;
  idNumber: string;
  phone: string;
  bloodType: string;
  companyName: string;
  department: string;
  address: string;
  validUntil: string;
  email: string;
  photoUrl: string | null;
  logoUrl: string | null;
  qrValue: string;
  templateColor: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum ProfessionType {
  CORPORATE_MALE = 'corporate_male',
  CORPORATE_FEMALE = 'corporate_female',
  MEDICAL = 'medical',
  GENERAL = 'general'
}
