import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { LoginPage } from '../pages/LoginPage';
// import { PositionsPage } from '../pages/PositionsPage';
// import { LimitsPage } from '../pages/LimitsPage';
// import { ForecastPage } from '../pages/ForecastPage';
// import { CompetitivePage } from '../pages/CompetitivePage';
import { AccountsPage } from '../pages/AccountsPage';
import { LegalPage } from '../pages/LegalPage';
import { HrPage } from '../pages/HrPage';
import { FinancialSummaryPage } from '../pages/FinancialSummaryPage';
import { AccountingPage } from '../pages/AccountingPage';
import { RedirectIfAuthenticated, RequireAuth } from './RouteGuards';

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/overview" replace /> },
          { path: 'overview', element: <OverviewPage /> },
          // { path: 'positions', element: <PositionsPage /> },
          // { path: 'limits', element: <LimitsPage /> },
          // { path: 'forecast', element: <ForecastPage /> },
          // { path: 'compete', element: <CompetitivePage /> },
          { path: 'accounts', element: <AccountsPage /> },
          { path: 'legal', element: <LegalPage /> },
          { path: 'hr', element: <HrPage /> },
          { path: 'financial-summary', element: <FinancialSummaryPage /> },
          { path: 'accounting', element: <AccountingPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
