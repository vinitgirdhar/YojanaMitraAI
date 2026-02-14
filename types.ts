
export type Language = 'en' | 'hi' | 'mr';

export enum UserCategory {
  Farmer = 'Farmer',
  Student = 'Student',
  SeniorCitizen = 'Senior Citizen',
  Woman = 'Woman',
  Entrepreneur = 'Entrepreneur',
  Unemployed = 'Unemployed'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  state: string;
  category: UserCategory;
  annualIncome: number;
  hasAadhaar: boolean;
  hasPan: boolean;
  hasRationCard: boolean;
  hasIncomeCertificate: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  matchPercentage: number;
  category: UserCategory;
  benefits: string;
  requiredDocs: string[];
  eligibility: 'High' | 'Partial' | 'NotEligible';
  description: string;
  url: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  description: string;
  status: 'Verified' | 'Missing' | 'Expired';
  expiryDate?: string;
  instructions: string[];
  officialUrl: string;
}
