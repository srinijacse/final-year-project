import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import { FaExchangeAlt, FaTimes } from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import { skills as availableSkillsList } from "../../util/Skills";
import { getSkillCategory } from "../../util/categories";

const Register = () => {
  const { register } = useUser();

  // Required basic information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Skills - user must select these
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const [selectedTeachInput, setSelectedTeachInput] = useState("");
  const [selectedLearnInput, setSelectedLearnInput] = useState("");

  // Profile information
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [availability, setAvailability] = useState("");

  // Optional social/profile links
  const [linkedinLink, setLinkedinLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add teaching skill
  const handleAddTeachSkill = () => {
    if (!selectedTeachInput) return;

    if (!teachSkills.includes(selectedTeachInput)) {
      setTeachSkills([...teachSkills, selectedTeachInput]);
    }

    setSelectedTeachInput("");
  };

  // Remove teaching skill
  const handleRemoveTeachSkill = (skillToRemove) => {
    setTeachSkills(
      teachSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Add learning skill
  const handleAddLearnSkill = () => {
    if (!selectedLearnInput) return;

    if (!learnSkills.includes(selectedLearnInput)) {
      setLearnSkills([...learnSkills, selectedLearnInput]);
    }

    setSelectedLearnInput("");
  };

  // Remove learning skill
  const handleRemoveLearnSkill = (skillToRemove) => {
    setLearnSkills(
      learnSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basic required fields
    if (!name || !email || !username || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Skills validation
    if (teachSkills.length === 0) {
      setError("Please add at least one skill you can teach.");
      return;
    }

    if (learnSkills.length === 0) {
      setError("Please add at least one skill you want to learn.");
      return;
    }

    // Profile validation
    if (!experienceLevel) {
      setError("Please select your experience level.");
      return;
    }

    if (!availability.trim()) {
      setError("Please select your availability.");
      return;
    }

    setLoading(true);

    const formattedTeach = teachSkills.map((skill) => ({
      name: skill,
      category: getSkillCategory(skill),
      status: "Claimed",
    }));

    const formattedLearn = learnSkills.map((skill) => ({
      name: skill,
      category: getSkillCategory(skill),
    }));

    const payload = {
      // Required fields
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password,

      // Skills
      skillsProficientAt: formattedTeach,
      skillsToLearn: formattedLearn,

      // Profile information
      bio: bio.trim(),
      location: location.trim(),
      experienceLevel,
      availability: availability.trim(),

      // Optional links
      linkedinLink: linkedinLink.trim(),
      githubLink: githubLink.trim(),
      portfolioLink: portfolioLink.trim(),
    };

    try {
      const res = await register(payload);

      setLoading(false);

      if (!res.success) {
        setError(res.error || "Registration failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5"
      style={{
        minHeight: "88vh",
        backgroundColor: "#0b1120",
        backgroundImage:
          "radial-gradient(ellipse at 50% 10%, rgba(59, 180, 161, 0.12) 0%, transparent 60%)",
      }}
    >
      <Container style={{ maxWidth: "600px" }}>
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
              Join SkillSwap
            </h2>

            <p
              className="small"
              style={{ color: "#94a3b8" }}
            >
              Create your peer profile and start swapping knowledge today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="danger" className="py-2 small">
              {error}
            </Alert>
          )}

          <Form
            onSubmit={handleRegister}
            autoComplete="off"
          >
            {/* Hidden fields to discourage browser autofill */}
            <input
              type="text"
              name="fake-username"
              autoComplete="username"
              tabIndex="-1"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                height: 0,
                width: 0,
              }}
            />

            <input
              type="password"
              name="fake-password"
              autoComplete="new-password"
              tabIndex="-1"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                height: 0,
                width: 0,
              }}
            />

            {/* Full Name & Username */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Full Name *
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="full-name"
                    autoComplete="off"
                    placeholder="e.g. Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Username *
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="new-username"
                    autoComplete="new-username"
                    placeholder="e.g. sarahc"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Email & Password */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Email Address *
                  </Form.Label>

                  <Form.Control
                    type="email"
                    name="new-email"
                    autoComplete="off"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Password *
                  </Form.Label>

                  <Form.Control
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Experience Level & Availability */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Experience Level *
                  </Form.Label>

                  <Form.Select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(e.target.value)
                    }
                    required
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: experienceLevel ? "#fff" : "#94a3b8",
                      padding: "0.75rem",
                    }}
                  >
                    <option value="">
                      Select experience level...
                    </option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">
                      Intermediate
                    </option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Availability *
                  </Form.Label>

                  <Form.Select
                    value={availability}
                    onChange={(e) =>
                      setAvailability(e.target.value)
                    }
                    required
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: availability ? "#fff" : "#94a3b8",
                      padding: "0.75rem",
                    }}
                  >
                    <option value="">
                      Select your availability...
                    </option>

                    <option value="Mornings">
                      Mornings
                    </option>

                    <option value="Afternoons">
                      Afternoons
                    </option>

                    <option value="Evenings">
                      Evenings
                    </option>

                    <option value="Weekdays">
                      Weekdays
                    </option>

                    <option value="Weekends">
                      Weekends
                    </option>

                    <option value="Evenings & Weekends">
                      Evenings & Weekends
                    </option>

                    <option value="Flexible">
                      Flexible
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Bio & Location */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Bio
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tell others a little about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-light small fw-semibold">
                    Location
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="e.g. Visakhapatnam"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    className="border-0 shadow-none"
                    style={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      color: "#fff",
                      padding: "0.75rem",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Social Links */}
            <div
              className="p-3 rounded-3 mb-3"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
              }}
            >
              <Form.Label className="text-light small fw-bold text-uppercase d-block mb-3">
                Profile Links
              </Form.Label>

              <Form.Group className="mb-3">
                <Form.Label className="text-light small">
                  LinkedIn
                </Form.Label>

                <Form.Control
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinLink}
                  onChange={(e) =>
                    setLinkedinLink(e.target.value)
                  }
                  className="border-0 shadow-none"
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                    padding: "0.75rem",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-light small">
                  GitHub
                </Form.Label>

                <Form.Control
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={githubLink}
                  onChange={(e) =>
                    setGithubLink(e.target.value)
                  }
                  className="border-0 shadow-none"
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                    padding: "0.75rem",
                  }}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="text-light small">
                  Portfolio
                </Form.Label>

                <Form.Control
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolioLink}
                  onChange={(e) =>
                    setPortfolioLink(e.target.value)
                  }
                  className="border-0 shadow-none"
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                    padding: "0.75rem",
                  }}
                />
              </Form.Group>
            </div>

            {/* Skills I Can Teach */}
            <div
              className="p-3 rounded-3 mb-3"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
              }}
            >
              <Form.Label className="text-info small fw-bold text-uppercase d-block mb-2">
                Skills I Can Teach *
              </Form.Label>

              {/* Selected Teaching Skills */}
              <div className="d-flex flex-wrap gap-1 mb-2">
                {teachSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    bg="info"
                    className="text-dark d-flex align-items-center gap-1 px-2 py-1"
                    style={{
                      borderRadius: "6px",
                    }}
                  >
                    <span>{skill}</span>

                    <FaTimes
                      size={10}
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleRemoveTeachSkill(skill)
                      }
                    />
                  </Badge>
                ))}
              </div>

              {/* Teaching Skill Selector */}
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedTeachInput}
                  onChange={(e) =>
                    setSelectedTeachInput(e.target.value)
                  }
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                  }}
                >
                  <option value="">
                    Select skill to teach...
                  </option>

                  {availableSkillsList.map((skill, index) => (
                    <option
                      key={index}
                      value={skill}
                    >
                      {skill}
                    </option>
                  ))}
                </Form.Select>

                <Button
                  type="button"
                  variant="outline-info"
                  size="sm"
                  onClick={handleAddTeachSkill}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Skills I Want to Learn */}
            <div
              className="p-3 rounded-3 mb-4"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
              }}
            >
              <Form.Label className="text-warning small fw-bold text-uppercase d-block mb-2">
                Skills I Want to Learn *
              </Form.Label>

              {/* Selected Learning Skills */}
              <div className="d-flex flex-wrap gap-1 mb-2">
                {learnSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    bg="warning"
                    className="text-dark d-flex align-items-center gap-1 px-2 py-1"
                    style={{
                      borderRadius: "6px",
                    }}
                  >
                    <span>{skill}</span>

                    <FaTimes
                      size={10}
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleRemoveLearnSkill(skill)
                      }
                    />
                  </Badge>
                ))}
              </div>

              {/* Learning Skill Selector */}
              <div className="d-flex gap-2">
                <Form.Select
                  value={selectedLearnInput}
                  onChange={(e) =>
                    setSelectedLearnInput(e.target.value)
                  }
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    color: "#fff",
                  }}
                >
                  <option value="">
                    Select skill to learn...
                  </option>

                  {availableSkillsList.map((skill, index) => (
                    <option
                      key={index}
                      value={skill}
                    >
                      {skill}
                    </option>
                  ))}
                </Form.Select>

                <Button
                  type="button"
                  variant="outline-warning"
                  size="sm"
                  onClick={handleAddLearnSkill}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Create Account Button */}
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
                "Create Free Account"
              )}
            </Button>

            {/* Login Link */}
            <div
              className="text-center mt-2"
              style={{
                color: "#cbd5e1",
                fontSize: "0.875rem",
              }}
            >
              <span>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#3bb4a1",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Link>
              </span>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default Register;