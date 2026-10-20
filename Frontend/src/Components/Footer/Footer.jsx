import { Container, Row, Col } from "react-bootstrap";
import { FaExchangeAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#080d1a",
        color: "#cbd5e1",
        borderTop: "1px solid #1e293b",
        padding: "2.5rem 0 1.5rem 0",
      }}
    >
      <Container>
        <Row className="gy-4 align-items-center mb-4">
          {/* Logo & Description */}
          <Col md={12} className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2 p-1.5"
                style={{ backgroundColor: "#3bb4a1" }}
              >
                <FaExchangeAlt color="#000" size={14} />
              </div>

              <span
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#f8fafc",
                }}
              >
                Time2Skill
              </span>
            </div>

            <p
              className="small mb-0 mx-auto"
              style={{
                maxWidth: "600px",
                color: "#cbd5e1",
                lineHeight: "1.6",
              }}
            >
              The peer-to-peer knowledge sharing and skill learning network
              with automated skill verification and GitHub portfolio evidence.
            </p>
          </Col>
        </Row>

        {/* Copyright */}
        <div
          className="text-center pt-3"
          style={{
            borderTop: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <p
            className="mb-0 small"
            style={{
              color: "#94a3b8",
            }}
          >
            © {new Date().getFullYear()} Time2Skill • Built with the MERN stack
            • Peer-to-Peer Learning
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;