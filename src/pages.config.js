import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import EmailParser from './pages/EmailParser';
import Carriers from './pages/Carriers';
import Compliance from './pages/Compliance';
import Drivers from './pages/Drivers';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "LoadBoard": LoadBoard,
    "EmailParser": EmailParser,
    "Carriers": Carriers,
    "Compliance": Compliance,
    "Drivers": Drivers,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};