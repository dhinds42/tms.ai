import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import EmailParser from './pages/EmailParser';
import Carriers from './pages/Carriers';
import Compliance from './pages/Compliance';
import Drivers from './pages/Drivers';
import ScoutAgent from './pages/ScoutAgent';
import Shippers from './pages/Shippers';
import Documents from './pages/Documents';
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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};