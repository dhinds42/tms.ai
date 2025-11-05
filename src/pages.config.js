import Dashboard from './pages/Dashboard';
import LoadBoard from './pages/LoadBoard';
import EmailParser from './pages/EmailParser';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "LoadBoard": LoadBoard,
    "EmailParser": EmailParser,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};