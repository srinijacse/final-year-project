import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaExchangeAlt,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";

const Login = () => {
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const res = await login(email, password);

    setLoading(false);

    if (!res.success) {
      setError(
        res.error || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5"
      style={{
        minHeight: "88vh",
        backgroundColor: "#0b1120",
        backgroundImage:
          "radial-gradient(ellipse at 50% 20%, rgba(59, 180, 161, 0.12) 0%, transparent 60%)",
      }}
    >
      <Container style={{ maxWidth: "480px" }}>
        <Card
          className="border-0 shadow-lg p-4 p-md-5 rounded-4"
          style={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
              style={{
                background:
                  "linear-gradient(135deg, #3bb4a1 0%, #0d9488 100%)",
                boxShadow: "0 0 20px rgba(59, 180, 161, 0.4)",
              }}
            >
              <FaExchangeAlt color="#000" size={24} />
            </div>

            <h2
              className="fw-bold text-light"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
              }}
            >
              Welcome Back
            </h2>

            <p
              className="small"
              style={{ color: "#94a3b8" }}
            >
              Log in to continue swapping skills with your peers
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleLogin}>
            {/* Email / Username */}
            <Form.Group className="mb-3">
              <Form.Label className="text-light small fw-semibold">
                Email Address or Username
              </Form.Label>

              <div
                className="d-flex align-items-center rounded-3"
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  overflow: "hidden",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    color: "#64748b",
                    flexShrink: 0,
                  }}
                >
                  <FaEnvelope />
                </div>

                <Form.Control
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 shadow-none"
                  style={{
                    backgroundColor: "transparent",
                    color: "#fff",
                    padding: "0.75rem 0.5rem",
                  }}
                />
              </div>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-4">
              <Form.Label className="text-light small fw-semibold">
                Password
              </Form.Label>

              <div
                className="d-flex align-items-center rounded-3"
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  overflow: "hidden",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "48px",
                    color: "#64748b",
                    flexShrink: 0,
                  }}
                >
                  <FaLock />
                </div>

                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-0 shadow-none"
                  style={{
                    backgroundColor: "transparent",
                    color: "#fff",
                    padding: "0.75rem 0.5rem",
                  }}
                />
              </div>
            </Form.Group>

            {/* Login Button */}
            <Button
              type="submit"
              size="lg"
              className="w-100 py-2 fw-bold border-0 rounded-3 mb-3 text-dark"
              style={{
                backgroundColor: "#3bb4a1",
              }}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Log In"
              )}
            </Button>

            {/* Register Link */}
            <div
              className="text-center mt-3"
              style={{
                color: "#cbd5e1",
                fontSize: "0.875rem",
              }}
            >
              <span>
                Dont have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#3bb4a1",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Sign up free
                </Link>
              </span>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default Login;