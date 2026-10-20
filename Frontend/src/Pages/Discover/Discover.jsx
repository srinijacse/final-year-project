import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, InputGroup, Spinner, Nav, Badge } from "react-bootstrap";
import { FaSearch, FaFilter, FaCompass, FaExchangeAlt, FaFire, FaTimes } from "react-icons/fa";
import ProfileCard from "./ProfileCard";
import { CATEGORIES } from "../../util/categories";
import axios from "axios";
import { toast } from "react-toastify";

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [activeTab, setActiveTab] = useState("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory && selectedCategory !== "all") {
        const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj) params.category = catObj.name;
      }
      if (experienceLevel) params.experienceLevel = experienceLevel;
      if (verificationFilter !== "all") params.verificationFilter = verificationFilter;
      if (minRating) params.minRating = minRating;

      const { data } = await axios.get("/user/discover", { params });
      if (data?.data) {
        setUsers(data.data.all || []);
      }
    } catch (err) {
      console.log("Error fetching discovered peers:", err);
      toast.error("Could not load discover feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedCategory, experienceLevel, verificationFilter, minRating]);

  // Client-side sorting & tab filtering
  let filteredUsers = [...users];

  if (activeTab === "mutual") {
    filteredUsers = filteredUsers.filter((u) => u.isMutualMatch || u.matchScore >= 60);
  } else if (activeTab === "verified") {
    filteredUsers = filteredUsers.filter((u) =>
      (u.skillsProficientAt || []).some((s) => s.status && s.status.includes("Verified"))
    );
  } else if (activeTab === "portfolio") {
    filteredUsers = filteredUsers.filter((u) =>
      (u.skillsProficientAt || []).some((s) => s.status === "Verified + Portfolio")
    );
  }

  if (sortBy === "rating") {
    filteredUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "sessions") {
    filteredUsers.sort((a, b) => (b.completedSessions || 0) - (a.completedSessions || 0));
  } else {
    // Default best match
    filteredUsers.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setExperienceLevel("");
    setVerificationFilter("all");
    setMinRating("");
    setSortBy("match");
    setActiveTab("all");
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== "all" ||
    experienceLevel ||
    verificationFilter !== "all" ||
    minRating;

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "92vh", paddingBottom: "4rem" }}>
      <Container className="py-4">
        {/* Header Title */}
        <div className="text-center text-md-start mb-4">
          <h2 className="fw-bold text-light mb-1 d-flex align-items-center justify-content-center justify-content-md-start gap-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
            <FaCompass className="text-warning" /> Discover Peer Mentors & Learners
          </h2>
          <p className="text-muted small mb-0">
            Find peers who can teach the skills you want to learn, or connect for mutual knowledge swaps.
          </p>
        </div>

        {/* Search & Top Filters Bar */}
        <div className="p-3 p-md-4 rounded-4 mb-4" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
          <Row className="g-3 align-items-center">
            {/* Search Input */}
            <Col lg={5}>
              <InputGroup>
                <InputGroup.Text style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#64748b" }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by skill (e.g. React, Python, AWS) or peer name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", padding: "0.65rem" }}
                />
                {search && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearch("")}
                    style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#94a3b8" }}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Verification Filter */}
            <Col sm={6} lg={3}>
              <Form.Select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", padding: "0.65rem" }}
              >
                <option value="all">All Verification Levels</option>
                <option value="verified">✓ Verified Skills Only</option>
                <option value="portfolio">✓ Verified + Portfolio Evidence</option>
              </Form.Select>
            </Col>

            {/* Experience Level */}
            <Col sm={6} lg={2}>
              <Form.Select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", padding: "0.65rem" }}
              >
                <option value="">All Experience</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </Form.Select>
            </Col>

            {/* Sort Order */}
            <Col sm={6} lg={2}>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff", padding: "0.65rem" }}
              >
                <option value="match">Best Match</option>
                <option value="rating">Highest Rated</option>
                <option value="sessions">Most Sessions</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Categories Pills Horizontal Scroll */}
          <div className="d-flex gap-2 overflow-auto pt-3 mt-3 border-top border-secondary border-opacity-25 pb-1">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? "info" : "outline-secondary"}
                className={`text-nowrap rounded-pill px-3 py-1.5 ${
                  selectedCategory === cat.id ? "text-dark fw-bold" : "text-light border-secondary"
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? "#3bb4a1" : "transparent",
                  borderColor: selectedCategory === cat.id ? "#3bb4a1" : "#334155",
                  fontSize: "0.82rem",
                }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="me-1">{cat.icon}</span>
                <span>{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* View Tabs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="gap-2"
          >
            <Nav.Item>
              <Nav.Link
                eventKey="all"
                className={`rounded-pill px-3 py-1.5 small ${
                  activeTab === "all" ? "bg-primary text-white" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                All Matches ({users.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="mutual"
                className={`rounded-pill px-3 py-1.5 small ${
                  activeTab === "mutual" ? "bg-success text-white" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                ⚡ Mutual Swaps
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="verified"
                className={`rounded-pill px-3 py-1.5 small ${
                  activeTab === "verified" ? "bg-info text-dark" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                ✓ Verified Mentors
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="portfolio"
                className={`rounded-pill px-3 py-1.5 small ${
                  activeTab === "portfolio" ? "bg-warning text-dark" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                🚀 GitHub Portfolio Proof
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              className="text-muted text-decoration-none p-0 align-self-start align-self-md-center"
              onClick={handleClearFilters}
            >
              Clear all filters ✕
            </Button>
          )}
        </div>

        {/* Peer Cards Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="text-muted small mt-2">Discovering compatible peers...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            className="p-5 text-center rounded-4 border border-secondary border-opacity-25 my-4"
            style={{ backgroundColor: "#1e293b" }}
          >
            <FaCompass size={40} className="text-muted mb-3" />
            <h5 className="fw-bold text-light">No matching peers found</h5>
            <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "450px" }}>
              We couldn't find anyone matching your current search or category filter. Try clearing your filters or searching for another skill.
            </p>
            <Button
              variant="outline-info"
              size="sm"
              className="rounded-pill px-4 py-2"
              onClick={handleClearFilters}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {filteredUsers.map((peer) => (
              <Col key={peer._id} sm={12} md={6} lg={4}>
                <ProfileCard
                  peer={peer}
                  onStatusChange={(peerId, newStatus) => {
                    setUsers((prev) =>
                      prev.map((u) =>
                        u._id === peerId ? { ...u, connectionStatus: newStatus } : u
                      )
                    );
                  }}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Discover;
