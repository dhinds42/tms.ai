import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import EmailParser from './pages/EmailParser';
import Carriers from './pages/Carriers';
import Compliance from './pages/Compliance';
import Drivers from './pages/Drivers';
import ScoutAgent from './pages/ScoutAgent';
import Shippers from './pages/Shippers';
import Documents from './pages/Documents';
import Invoicing from './pages/Invoicing';
import TenderBot from './pages/TenderBot';
import Rosie from './pages/Rosie';
import FinanceBot from './pages/FinanceBot';
import CarrierOnboarding from './pages/CarrierOnboarding';
import MaintenanceAlerts from './pages/MaintenanceAlerts';
import DriverPerformance from './pages/DriverPerformance';
import PayrollManagement from './pages/PayrollManagement';
import FuelManagement from './pages/FuelManagement';
import BackhaulOptimizer from './pages/BackhaulOptimizer';
import CarrierPortal from './pages/CarrierPortal';
import RateNegotiator from './pages/RateNegotiator';
import DocumentProcessor from './pages/DocumentProcessor';
import CarrierCompliance from './pages/CarrierCompliance';
import ContractAssistant from './pages/ContractAssistant';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import ShipperPortal from './pages/ShipperPortal';
import DispatchAssistant from './pages/DispatchAssistant';
import MarketRateFeed from './pages/MarketRateFeed';
import CarrierPerformanceScore from './pages/CarrierPerformanceScore';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "LoadBoard": LoadBoard,
    "EmailParser": EmailParser,
    "Carriers": Carriers,
    "Compliance": Compliance,
    "Drivers": Drivers,
    "ScoutAgent": ScoutAgent,
    "Shippers": Shippers,
    "Documents": Documents,
    "Invoicing": Invoicing,
    "TenderBot": TenderBot,
    "Rosie": Rosie,
    "FinanceBot": FinanceBot,
    "CarrierOnboarding": CarrierOnboarding,
    "MaintenanceAlerts": MaintenanceAlerts,
    "DriverPerformance": DriverPerformance,
    "PayrollManagement": PayrollManagement,
    "FuelManagement": FuelManagement,
    "BackhaulOptimizer": BackhaulOptimizer,
    "CarrierPortal": CarrierPortal,
    "RateNegotiator": RateNegotiator,
    "DocumentProcessor": DocumentProcessor,
    "CarrierCompliance": CarrierCompliance,
    "ContractAssistant": ContractAssistant,
    "PredictiveAnalytics": PredictiveAnalytics,
    "ShipperPortal": ShipperPortal,
    "DispatchAssistant": DispatchAssistant,
    "MarketRateFeed": MarketRateFeed,
    "CarrierPerformanceScore": CarrierPerformanceScore,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};