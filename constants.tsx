
import { Scheme, DocumentInfo, UserCategory } from './types';

export const SCHEMES: Scheme[] = [
  {
    id: '1',
    name: 'PM Kisan Samman Nidhi',
    matchPercentage: 98,
    category: UserCategory.Farmer,
    benefits: 'Direct benefit transfer of ₹6,000 per year in three installments.',
    requiredDocs: ['Aadhaar Card', 'Land Holding Documents', 'Bank Account'],
    eligibility: 'High',
    description: 'A central sector scheme with 100% funding from Government of India to provide income support to all landholding farmers families.',
    url: 'https://pmkisan.gov.in/'
  },
  {
    id: '2',
    name: 'Ayushman Bharat (PM-JAY)',
    matchPercentage: 85,
    category: UserCategory.SeniorCitizen,
    benefits: 'Health cover of ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    requiredDocs: ['Ration Card', 'Aadhaar Card'],
    eligibility: 'High',
    description: 'The world\'s largest health insurance/ assurance scheme fully financed by the government.',
    url: 'https://nha.gov.in/PM-JAY'
  },
  {
    id: '3',
    name: 'Post-Matric Scholarship',
    matchPercentage: 92,
    category: UserCategory.Student,
    benefits: 'Financial assistance to students belonging to SC/ST/OBC categories.',
    requiredDocs: ['Caste Certificate', 'Income Certificate', 'Aadhaar'],
    eligibility: 'High',
    description: 'Scholarships for students belonging to marginalized categories to help them complete their higher education.',
    url: 'https://scholarships.gov.in/'
  },
  {
    id: '4',
    name: 'Atal Pension Yojana',
    matchPercentage: 45,
    category: UserCategory.Entrepreneur,
    benefits: 'Guaranteed minimum pension of ₹1,000 to ₹5,000 per month.',
    requiredDocs: ['Aadhaar Card', 'Bank Account'],
    eligibility: 'Partial',
    description: 'A pension scheme for citizens in the unorganized sector.',
    url: 'https://www.npscra.nsdl.co.in/scheme-details.php'
  }
];

export const DOCUMENTS: DocumentInfo[] = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card',
    description: '12-digit unique identity number.',
    status: 'Verified',
    instructions: ['Keep mobile linked', 'Biometric update every 10 years'],
    officialUrl: 'https://uidai.gov.in/'
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Permanent Account Number for tax purposes.',
    status: 'Missing',
    instructions: ['Required for bank accounts over ₹50,000', 'Link with Aadhaar'],
    officialUrl: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html'
  },
  {
    id: 'income',
    name: 'Income Certificate',
    description: 'Proof of annual income of the family.',
    status: 'Expired',
    expiryDate: '2023-12-31',
    instructions: ['Apply via local Tehsildar', 'Required for scholarships'],
    officialUrl: 'https://edistrict.gov.in/'
  },
  {
    id: 'ration',
    name: 'Ration Card',
    description: 'Document for food security and identification.',
    status: 'Verified',
    instructions: ['Valid at Fair Price Shops', 'Keep member details updated'],
    officialUrl: 'https://nfsa.gov.in/'
  }
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'mr', label: 'Marathi (मराठी)' }
];
