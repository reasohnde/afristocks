// Mock Data
const mockStartups: Startup[] = [
  {
    id: '1',
    name: 'AgroTech Solutions',
    logo: '🌾',
    sector: 'Agriculture',
    country: 'Côte d\'Ivoire',
    valuation: 2500000,
    sharePrice: 100,
    availableShares: 10000,
    minInvestment: 5000,
    description: 'Plateforme digitale connectant agriculteurs et acheteurs',
    growth: 15.5,
  },
  {
    id: '2',
    name: 'MediConnect Africa',
    logo: '🏥',
    sector: 'Santé',
    country: 'Sénégal',
    valuation: 3200000,
    sharePrice: 150,
    availableShares: 8000,
    minInvestment: 7500,
    description: 'Télémédecine pour zones rurales',
    growth: 22.3,
  },
  {
    id: '3',
    name: 'EduTech Pro',
    logo: '📚',
    sector: 'Éducation',
    country: 'Ghana',
    valuation: 1800000,
    sharePrice: 80,
    availableShares: 12000,
    minInvestment: 4000,
    description: 'E-learning adapté au contexte africain',
    growth: 18.7,
  },
];

const mockInvestments: Investment[] = [
  {
    id: '1',
    startupId: '1',
    startupName: 'AgroTech Solutions',
    shares: 50,
    investedAmount: 5000,
    currentValue: 5775,
    returnPercentage: 15.5,
    date: '2024-01-15',
  },
  {
    id: '2',
    startupId: '2',
    startupName: 'MediConnect Africa',
    shares: 100,
    investedAmount: 15000,
    currentValue: 18345,
    returnPercentage: 22.3,
    date: '2024-02-20',
  },
];

export { mockStartups, mockInvestments };