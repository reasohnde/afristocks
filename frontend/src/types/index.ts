// Types principaux pour l'application AfriStocks

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER' | 'STARTUP' | 'INVESTOR';
    balance?: number;
    portfolio?: number;
    returns?: number;
    verified?: boolean;
}

export interface Startup {
    id: string;
    name: string;
    sector?: string;
    country?: string;
    city?: string;
    description?: string;
    fundingGoal?: number;
    currentFunding?: number;
    valuation?: number;
    sharePrice?: number;
    availableShares?: number;
    totalShares?: number;
    growth?: number;
    rating?: number;
    verified?: boolean;
    pitchDeck?: boolean;
    video?: boolean;
    raised?: number;
    investors?: number;
    founded?: string;
    team?: number;
}

// Types pour le contexte Auth
export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: RegisterData) => Promise<void>;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'STARTUP' | 'INVESTOR';
    phoneNumber?: string;
    sector?: string;
    country?: string;
    city?: string;
}

// Types pour Fund Context
export interface FundContextType {
    funds: Fund[];
    loading: boolean;
    error: string | null;
    createInvestment?: (data: InvestmentData) => Promise<void>;
    addInvestment?: (data: InvestmentData) => Promise<void>;
    fundData?: Fund;
}

export interface Fund {
    id: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    minInvestment: number;
    returns: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    expectedReturn?: string;
}

export interface InvestmentData {
    fundId: string;
    amount: number;
    paymentMethod: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    status?: string;
}

// Types pour les composants UI
export interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'primary' | 'secondary';
    hoverable?: boolean;
    onClick?: () => void;
    glowColor?: string;
}

export interface BadgeProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    unlocked: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
}

// Types pour les vues
export interface StartupDashboardViewProps {
    startup: Startup;
    setActiveView: (view: string) => void;
}

export interface InvestmentCheckoutViewProps {
    amount: number;
    fundId: string;
    onClose: () => void;
    isAuthenticated: boolean;
    user: User | null;
    setActiveView: (view: string) => void;
    checkoutData?: any;
}

// Types pour les modales
export interface KycActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    action: string;
    onConfirm: (reason: string) => void;
}

// Types pour les actualités
export interface NewsArticle {
    id: string;
    title: string;
    content: string;
    summary: string;
    source: string;
    publishedAt: string;
    url: string;
    imageUrl?: string;
    sectors?: string[];
    countries?: string[];
    sentiment?: 'positif' | 'négatif' | 'neutre';
    impactScore?: number;
    importance?: string;
}

// Types pour les formations
export interface Formation {
    id: string;
    title: string;
    description: string;
    duration: string;
    level: 'débutant' | 'intermédiaire' | 'avancé';
    price: number;
    instructor: string;
    modules: FormationModule[];
    rating?: number;
    students?: number;
}

export interface FormationModule {
    id: string;
    title: string;
    duration: string;
    content: string;
    videoUrl?: string;
}

// Types pour les notifications
export interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    time: string;
    read?: boolean;
}

// Types pour le trading
export interface Trade {
    id: string;
    startupId: string;
    price: number;
    quantity: number;
    timestamp: number;
    type: 'buy' | 'sell';
}

export interface OrderBook {
    bids: Order[];
    asks: Order[];
}

export interface Order {
    price: number;
    quantity: number;
    total: number;
} 