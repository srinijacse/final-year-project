
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  FaExchangeAlt,
  FaCheckCircle,
  FaGithub,
  FaComments,
  FaCalendarCheck,
  FaStar,
  FaAward,
  FaArrowRight,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { CATEGORIES } from "../../util/categories";
import { useUser } from "../../util/UserContext";

const LandingPage = () => {
  const { user } = useUser();

  const sampleMentors = [
    {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      teaches: "React, Next.js, JS",
      wants: "Python, AWS",
      badge: "Verified + Portfolio",
      score: "95% Score",
      rating: 4.9,
      sessions: 32,
    },
    {
      name: "Dr. Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      teaches: "Python, ML, SQL",
      wants: "React, UI/UX",
      badge: "Verified + Portfolio",
      score: "96% Score",
      rating: 4.8,
      sessions: 26,
    },
    {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      teaches: "AWS, Git, Docker",
      wants: "React, HTML/CSS",
      badge: "Verified + Portfolio",
      score: "94% Score",
      rating: 4.7,
      sessions: 18,
    },
    {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      teaches: "Node.js, Express, MongoDB",
      wants: "Cybersecurity, AWS",
      badge: "Verified + Portfolio",
      score: "92% Score",
      rating: 4.9,
      sessions: 22,
    },
  ];

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="py-5 py-lg-6 position-relative overflow-hidden">
        <div
          className="position-absolute"
          style={{
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(circle, rgba(59, 180, 161, 0.15) 0%, rgba(15, 23, 42, 0) 70%)",
            zIndex: 0,
          }}
        />

        <Container className="position-relative" style={{ zIndex: 1 }}>
          <Row className="align-items-center min-vh-75 py-4">
            <Col lg={7} className="text-center text-lg-start mb-5 mb-lg-0">
              <Badge
                className="px-3 py-2 rounded-pill mb-3 border border-secondary"
                style={{
                  backgroundColor: "rgba(59, 180, 161, 0.15)",
                  color: "#3bb4a1",
                  fontSize: "0.85rem",
                }}
              >
                ⚡ The Peer-to-Peer Skill Exchange Platform
              </Badge>

              <h1
                className="display-4 fw-bolder mb-4 lh-sm"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  letterSpacing: "-0.5px",
                }}
              >
                Teach what you know. <br />
                <span
                  style={{
                    background: "linear-gradient(to right, #3bb4a1, #fbf1a4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Learn what you want.
                </span>
              </h1>

              <p className="lead text-secondary mb-4 fs-5" style={{ maxWidth: "600px" }}>
                Time2Skill connects curious minds for mutual knowledge sharing. Swap skills with real developers and specialists, verify your expertise through tests and GitHub evidence, and conduct trusted 1-on-1 sessions.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Button
                  as={Link}
                  to={user ? "/discover" : "/register"}
                  size="lg"
                  className="px-4 py-3 fw-bold rounded-3 shadow-lg d-flex align-items-center gap-2 border-0"
                  style={{
                    backgroundColor: "#3bb4a1",
                    color: "#000",
                    boxShadow: "0 10px 25px rgba(59, 180, 161, 0.4)",
                  }}
                >
                  <span>{user ? "Explore Discovery Feed" : "Start Swapping Free"}</span>
                  <FaArrowRight size={14} />
                </Button>

                <Button
                  as={Link}
                  to="/discover"
                  size="lg"
                  variant="outline-secondary"
                  className="px-4 py-3 fw-semibold rounded-3 text-light border-secondary"
                >
                  Browse Mentors & Peers
                </Button>
              </div>

              {/* Trust Metrics */}
              <div className="d-flex flex-wrap gap-4 mt-5 pt-3 border-top border-secondary border-opacity-25 justify-content-center justify-content-lg-start">
                <div>
                  <div className="fs-4 fw-bold text-light">11+</div>
                  <div className="text-muted small">Verified Skill Tracks</div>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-light">100%</div>
                  <div className="text-muted small">Peer-to-Peer Free</div>
                </div>
                <div>
                  <div className="fs-4 fw-bold text-light">✓ GitHub</div>
                  <div className="text-muted small">Automated Portfolio Proof</div>
                </div>
              </div>
            </Col>

            {/* Interactive Concept Graphic */}
            <Col lg={5}>
              <div
                className="p-4 rounded-4 shadow-lg border border-secondary border-opacity-25 position-relative"
                style={{
                  backgroundColor: "#1e293b",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                    ✓ Perfect Mutual Swap Match
                  </span>
                  <span className="text-muted small">Compatibility: 96%</span>
                </div>

                {/* Peer A Card */}
                <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                      alt="Alex"
                      className="rounded-circle"
                      style={{ width: "42px", height: "42px", objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-bold text-light small">Alex (Frontend Architect)</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>⭐ 4.9 • 32 Sessions Completed</div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-light small">
                    <div>
                      <span className="text-muted">Teaches: </span>
                      <span className="badge bg-teal bg-opacity-25 text-info border border-info">✓ React (Verified)</span>
                    </div>
                    <div>
                      <span className="text-muted">Wants: </span>
                      <span className="text-warning">Python</span>
                    </div>
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="text-center my-2">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle p-2"
                    style={{ backgroundColor: "#3bb4a1", color: "#000" }}
                  >
                    <FaExchangeAlt size={16} />
                  </div>
                </div>

                {/* Peer B Card */}
                <div className="p-3 rounded-3" style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                      alt="Priya"
                      className="rounded-circle"
                      style={{ width: "42px", height: "42px", objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-bold text-light small">Dr. Priya (AI Researcher)</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>⭐ 4.8 • 26 Sessions Completed</div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center text-light small">
                    <div>
                      <span className="text-muted">Teaches: </span>
                      <span className="badge bg-emerald bg-opacity-25 text-success border border-success">✓ Python (Portfolio Verified)</span>
                    </div>
                    <div>
                      <span className="text-muted">Wants: </span>
                      <span className="text-info">React</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How SkillSwap Works */}
      <section className="py-5" style={{ backgroundColor: "#0f172a" }}>
        <Container>
          <div className="text-center mb-5">
            <h6 className="text-uppercase fw-bold" style={{ color: "#3bb4a1", letterSpacing: "1px" }}>
              How It Works
            </h6>
            <h2 className="fw-bold text-light display-6">
              Peer-to-Peer Learning in 4 Simple Steps
            </h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
              No paid tutors. No passive pre-recorded videos. Just direct collaboration between peers with complementary knowledge.
            </p>
          </div>

          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(59, 180, 161, 0.15)", color: "#3bb4a1" }}
                >
                  <span className="fw-bold fs-4">1</span>
                </div>
                <h5 className="fw-bold text-light mb-2">Define Your Skills</h5>
                <p className="text-muted small mb-0">
                  List the skills you are proficient at and ready to share, alongside the technologies you are excited to learn next.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}
                >
                  <span className="fw-bold fs-4">2</span>
                </div>
                <h5 className="fw-bold text-light mb-2">Verify & Add Proof</h5>
                <p className="text-muted small mb-0">
                  Take interactive skill tests and link your public GitHub repositories for automated portfolio evidence analysis.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(251, 191, 36, 0.15)", color: "#fbbf24" }}
                >
                  <span className="fw-bold fs-4">3</span>
                </div>
                <h5 className="fw-bold text-light mb-2">Match & Chat</h5>
                <p className="text-muted small mb-0">
                  Time2Skill smartly matches and pairs you with peers who teach what you want and want what you teach. Chat in real-time.
                </p>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100 p-4 border-0 rounded-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(52, 211, 153, 0.15)", color: "#34d399" }}
                >
                  <span className="fw-bold fs-4">4</span>
                </div>
                <h5 className="fw-bold text-light mb-2">Learn & Review</h5>
                <p className="text-muted small mb-0">
                  Schedule structured learning sessions, complete peer exchanges, and leave verified ratings to build reputation.
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Verified Peer Mentors Showcase */}
      <section className="py-5" style={{ backgroundColor: "#0b1120" }}>
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end mb-4">
            <div>
              <h6 className="text-uppercase fw-bold" style={{ color: "#3bb4a1" }}>
                Community Mentors
              </h6>
              <h2 className="fw-bold text-light">Featured Verified Peers</h2>
            </div>
            <Link
              to="/discover"
              className="text-info text-decoration-none fw-semibold d-flex align-items-center gap-1 mt-2 mt-md-0"
            >
              <span>Explore All Mentors</span>
              <FaArrowRight size={12} />
            </Link>
          </div>

          <Row className="g-4">
            {sampleMentors.map((m, idx) => (
              <Col key={idx} md={6} lg={3}>
                <Card
                  className="h-100 p-3 rounded-4 border border-secondary border-opacity-25"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="rounded-circle"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="fw-bold text-light mb-0">{m.name}</h6>
                      <div className="d-flex align-items-center gap-1 text-warning small">
                        <FaStar size={12} />
                        <span>{m.rating}</span>
                        <span className="text-muted">({m.sessions} sessions)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-muted small d-block">Teaches:</span>
                    <div className="fw-semibold text-info small">{m.teaches}</div>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted small d-block">Looking to learn:</span>
                    <div className="fw-semibold text-warning small">{m.wants}</div>
                  </div>

                  <div className="mt-auto pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                    <Badge bg="success" className="px-2 py-1">
                      ✓ {m.badge}
                    </Badge>
                    <span className="text-muted small">{m.score}</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 text-center position-relative" style={{ backgroundColor: "#0f172a" }}>
        <Container>
          <div
            className="p-5 rounded-4 border border-secondary border-opacity-25"
            style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
            }}
          >
            <h2 className="display-6 fw-bold text-light mb-3">
              Ready to Swap Skills and Accelerate Your Learning?
            </h2>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "600px" }}>
              Join thousands of developers, designers, and domain specialists exchanging knowledge for free today.
            </p>
            <Button
              as={Link}
              to={user ? "/discover" : "/register"}
              size="lg"
              className="px-5 py-3 fw-bold rounded-pill border-0"
              style={{ backgroundColor: "#3bb4a1", color: "#000" }}
            >
              Get Started with Time2Skill
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
