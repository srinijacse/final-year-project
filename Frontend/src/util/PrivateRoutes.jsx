import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { Spinner } from "react-bootstrap";

const PrivateRoutes = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh", backgroundColor: "#0f172a" }}
      >
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
