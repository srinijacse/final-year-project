
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaExchangeAlt,
  FaCheckCircle,
  FaGithub,
  
  FaShieldAlt,
  FaLightbulb,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";

const AboutUs = () => {
  const { user } = useUser();

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "92vh", paddingBottom: "4rem" }}>
      {/* Hero */}
      <section className="py-5 text-center" style={{ backgroundColor: "#0f172a" }}>
        <Container style={{ maxWidth: "800px" }}>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
            style={{
              background: "linear-gradient(135deg, #3bb4a1 0%, #0d9488 100%)",
              boxShadow: "0 0 20px rgba(59, 180, 161, 0.4)",
            }}
          >
            <FaExchangeAlt color="#000" size={28} />
          </div>

          <h1 className="display-5 fw-bold text-light mb-3" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            About Time2Skill
          </h1>
          <p className="lead text-secondary mb-0">
            A peer-to-peer skill learning and knowledge-sharing platform built for developers, designers, and passionate creators.
          </p>
        </Container>
      </section>

      <Container className="py-5" style={{ maxWidth: "950px" }}>
        {/* Core Philosophy */}
        <Row className="g-4 mb-5">
          <Col md={6}>
            <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              <div className="d-flex align-items-center gap-2 text-info mb-3">
                <FaLightbulb size={24} />
                <h4 className="fw-bold text-light mb-0">The Problem</h4>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.7" }}>
                People want to learn practical skills from real people, but finding suitable, trustworthy peers is difficult. Traditional online courses are passive and static, and hiring private tutors is expensive. Often, someone who wants to learn React already has valuable knowledge in Python or AWS to offer in return!
              </p>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              <div className="d-flex align-items-center gap-2 text-success mb-3">
                <FaExchangeAlt size={24} />
                <h4 className="fw-bold text-light mb-0">The SkillSwap Solution</h4>
              </div>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.7" }}>
                Time2Skill replaces one-directional teaching with <strong>peer-to-peer knowledge exchange</strong>. By matching complementary learning and teaching goals, users discover peers with mutual synergy, verify skills through assessments and GitHub portfolio analysis, and arrange structured 1-on-1 sessions.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Pillars */}
        <h3 className="fw-bold text-light text-center mb-4" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
          What Makes Time2Skill Unique
        </h3>

        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              <FaCheckCircle className="text-info mb-3" size={32} />
              <h5 className="fw-bold text-light mb-2">Skill Verification Tests</h5>
              <p className="text-muted small mb-0">
                Claimed skills can be verified through rigorous, conceptual assessments across 11 key technology disciplines.
              </p>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              <FaGithub className="text-warning mb-3" size={32} />
              <h5 className="fw-bold text-light mb-2">GitHub Portfolio Evidence</h5>
              <p className="text-muted small mb-0">
                Automated repository inspection analyzes project dependencies, code structure, and README documentation for real-world proof.
              </p>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              <FaShieldAlt className="text-success mb-3" size={32} />
              <h5 className="fw-bold text-light mb-2">Verified Peer Reviews</h5>
              <p className="text-muted small mb-0">
                Reviews are tied to completed sessions to prevent spam and build trustworthy community credibility.
              </p>
            </Card>
          </Col>
        </Row>

        {/* CTA */}
        <div className="text-center pt-3">
          <Button
            as={Link}
            to={user ? "/discover" : "/register"}
            size="lg"
            className="px-5 py-3 fw-bold rounded-pill border-0 text-dark"
            style={{ backgroundColor: "#3bb4a1" }}
          >
            {user ? "Explore Discovery Feed" : "Join the Time2Skill Network"}
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default AboutUs;
