import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Users from './pages/Users';
import Drivers from './pages/Drivers';
import Tractors from './pages/Tractors';
import Trailers from './pages/Trailers';
import Couplings from './pages/Couplings';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import Maintenance from './pages/Maintenance';
import Documents from './pages/Documents';
import Finance from './pages/Finance';
import Reports from './pages/Reports';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="tractors" element={<Tractors />} />
          <Route path="trailers" element={<Trailers />} />
          <Route path="couplings" element={<Couplings />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="documents" element={<Documents />} />
          <Route path="finance" element={<Finance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



