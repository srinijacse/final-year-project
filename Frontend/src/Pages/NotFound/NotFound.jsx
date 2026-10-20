import React from "react";
import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa";

const NotFound = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center text-center py-5"
      style={{ minHeight: "75vh", color: "#f8fafc" }}
    >
      <Container style={{ maxWidth: "500px" }}>
        <FaCompass size={54} className="text-warning mb-3 opacity-75" />
        <h1 className="display-4 fw-bold">404</h1>
        <h4 className="fw-semibold mb-3">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          as={Link}
          to="/"
          className="border-0 text-dark fw-bold px-4 py-2 rounded-pill"
          style={{ backgroundColor: "#3bb4a1" }}
        >
          Return Home
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;
