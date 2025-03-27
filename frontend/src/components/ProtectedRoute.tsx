import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute: React.FC = () => {
  const authToken: string | undefined = Cookies.get("token");

  return authToken ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
