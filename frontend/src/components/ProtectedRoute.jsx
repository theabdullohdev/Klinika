import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ token }) => {
  const activeToken = token || localStorage.getItem('token');
  
  if (!activeToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
