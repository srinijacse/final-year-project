import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaArrowLeft,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import { skills as availableSkillsList } from "../../util/Skills";
import {
  CATEGORIES,
  getSkillCategory,
} from "../../util/categories";
import axios from "axios";
import { toast } from "react-toastify";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
];

// =====================================================
// COMMON STYLES FOR DARK THEME
// =====================================================

const inputStyle = {
  backgroundColor: "#0f172a",
  borderColor: "#475569",
  color: "#f8fafc",
  WebkitTextFillColor: "#f8fafc",
};

const selectStyle = {
  backgroundColor: "#0f172a",
  borderColor: "#475569",
  color: "#f8fafc",
  WebkitTextFillColor: "#f8fafc",
};

const labelStyle = {
  color: "#f8fafc",
};

const placeholderStyle = {
  color: "#94a3b8",
  opacity: 1,
};

// =====================================================
// COMPONENT
// =====================================================

const EditProfile = () => {
  const { user, setUser, refreshUser } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState("Intermediate");
  const [availability, setAvailability] = useState("");
  const [picture, setPicture] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newTeachCat, setNewTeachCat] =
    useState("Web Development");

  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [newLearnCat, setNewLearnCat] =
    useState("Programming");

  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD USER DATA
  // =====================================================

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "Remote / Online");
      setExperienceLevel(
        user.experienceLevel || "Intermediate"
      );
      setAvailability(
        user.availability || "Flexible"
      );
      setPicture(
        user.picture || AVATAR_PRESETS[0]
      );
      setGithubLink(user.githubLink || "");
      setLinkedinLink(
        user.linkedinLink || ""
      );
      setPortfolioLink(
        user.portfolioLink || ""
      );
      setTeachSkills(
        user.skillsProficientAt || []
      );
      setLearnSkills(
        user.skillsToLearn || []
      );
    }
  }, [user]);

  // =====================================================
  // ADD TEACHING SKILL
  // =====================================================

  const handleAddTeachSkill = () => {
    if (!newTeachSkill.trim()) return;

    const exists = teachSkills.some(
      (s) =>
        (s.name || s)
          .toLowerCase() ===
        newTeachSkill.trim().toLowerCase()
    );

    if (exists) {
      toast.warn(
        "Skill already added in teaching skills."
      );
      return;
    }

    setTeachSkills([
      ...teachSkills,
      {
        name: newTeachSkill.trim(),
        category:
          newTeachCat ||
          getSkillCategory(newTeachSkill),
        status: "Claimed",
      },
    ]);

    setNewTeachSkill("");
  };

  // =====================================================
  // REMOVE TEACHING SKILL
  // =====================================================

  const handleRemoveTeachSkill = (skillName) => {
    setTeachSkills(
      teachSkills.filter(
        (s) => (s.name || s) !== skillName
      )
    );
  };

  // =====================================================
  // ADD LEARNING SKILL
  // =====================================================

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.trim()) return;

    const exists = learnSkills.some(
      (s) =>
        (s.name || s)
          .toLowerCase() ===
        newLearnSkill.trim().toLowerCase()
    );

    if (exists) {
      toast.warn(
        "Skill already added in learning skills."
      );
      return;
    }

    setLearnSkills([
      ...learnSkills,
      {
        name: newLearnSkill.trim(),
        category:
          newLearnCat ||
          getSkillCategory(newLearnSkill),
      },
    ]);

    setNewLearnSkill("");
  };

  // =====================================================
  // REMOVE LEARNING SKILL
  // =====================================================

  const handleRemoveLearnSkill = (skillName) => {
    setLearnSkills(
      learnSkills.filter(
        (s) => (s.name || s) !== skillName
      )
    );
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        experienceLevel,
        availability: availability.trim(),
        picture,
        githubLink: githubLink.trim(),
        linkedinLink: linkedinLink.trim(),
        portfolioLink: portfolioLink.trim(),
        skillsProficientAt: teachSkills,
        skillsToLearn: learnSkills,
      };

      const { data } = await axios.post(
        "/user/updateProfile",
        payload
      );

      setUser(data.data);

      toast.success(
        "Profile updated successfully!"
      );

      navigate(`/profile/${user.username}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        color: "#f8fafc",
        minHeight: "92vh",
        paddingBottom: "4rem",
      }}
    >
      <Container
        className="py-4"
        style={{ maxWidth: "860px" }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="d-flex align-items-center gap-1 text-light"
          >
            <FaArrowLeft />
            Back
          </Button>

          <h3
            className="fw-bold mb-0"
            style={{
              fontFamily:
                "'Josefin Sans', sans-serif",
              color: "#f8fafc",
            }}
          >
            Edit Profile
          </h3>

          <div style={{ width: "70px" }}></div>
        </div>

        <Form onSubmit={handleSave}>

          {/* =================================================
              BASIC INFO
          ================================================= */}

          <Card
            className="p-4 border-0 rounded-4 mb-4"
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
          >

            <h5
              className="fw-bold mb-3"
              style={{ color: "#f8fafc" }}
            >
              Personal Details
            </h5>

            {/* Avatar */}

            <div className="mb-4">

              <Form.Label
                className="small fw-semibold d-block mb-2"
                style={labelStyle}
              >
                Profile Avatar
              </Form.Label>

              <div className="d-flex align-items-center gap-3 mb-2">

                <img
                  src={
                    picture ||
                    AVATAR_PRESETS[0]
                  }
                  alt="Avatar"
                  className="rounded-circle shadow"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    border:
                      "3px solid #3bb4a1",
                  }}
                />

                <div>

                  <span
                    className="small d-block mb-1"
                    style={{
                      color: "#cbd5e1",
                    }}
                  >
                    Select from presets or paste
                    an image URL:
                  </span>

                  <div className="d-flex gap-2">

                    {AVATAR_PRESETS.map(
                      (preset, idx) => (
                        <img
                          key={idx}
                          src={preset}
                          alt="preset"
                          className="rounded-circle"
                          style={{
                            width: "36px",
                            height: "36px",
                            objectFit: "cover",
                            cursor: "pointer",
                            border:
                              picture === preset
                                ? "2px solid #3bb4a1"
                                : "1px solid #475569",
                          }}
                          onClick={() =>
                            setPicture(preset)
                          }
                        />
                      )
                    )}

                  </div>
                </div>
              </div>

              <Form.Control
                type="text"
                placeholder="Or paste custom image URL"
                value={picture}
                onChange={(e) =>
                  setPicture(e.target.value)
                }
                style={{
                  ...inputStyle,
                  fontSize: "0.85rem",
                }}
              />

            </div>

            <Row className="g-3">

              {/* Full Name */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Full Name *
                  </Form.Label>

                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    style={inputStyle}
                    required
                  />

                </Form.Group>

              </Col>

              {/* Experience */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Experience Level
                  </Form.Label>

                  <Form.Select
                    value={experienceLevel}
                    onChange={(e) =>
                      setExperienceLevel(
                        e.target.value
                      )
                    }
                    style={selectStyle}
                  >
                    <option
                      value="Beginner"
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#f8fafc",
                      }}
                    >
                      Beginner
                    </option>

                    <option
                      value="Intermediate"
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#f8fafc",
                      }}
                    >
                      Intermediate
                    </option>

                    <option
                      value="Advanced"
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#f8fafc",
                      }}
                    >
                      Advanced
                    </option>

                    <option
                      value="Expert"
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#f8fafc",
                      }}
                    >
                      Expert
                    </option>
                  </Form.Select>

                </Form.Group>

              </Col>

              {/* Location */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Location
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

              {/* Availability */}

              <Col md={6}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Availability
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="e.g. Weekdays 6-9 PM, Weekends"
                    value={availability}
                    onChange={(e) =>
                      setAvailability(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

              {/* Bio */}

              <Col xs={12}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Bio / Summary
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe your engineering focus, what you love sharing, and learning goals..."
                    value={bio}
                    onChange={(e) =>
                      setBio(e.target.value)
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

            </Row>
          </Card>

          {/* =================================================
              LINKS & PORTFOLIO
          ================================================= */}

          <Card
            className="p-4 border-0 rounded-4 mb-4"
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
          >

            <h5
              className="fw-bold mb-3"
              style={{ color: "#f8fafc" }}
            >
              Links & Portfolio
            </h5>

            <Row className="g-3">

              {/* GitHub */}

              <Col md={4}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    GitHub URL
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="https://github.com/username"
                    value={githubLink}
                    onChange={(e) =>
                      setGithubLink(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

              {/* LinkedIn */}

              <Col md={4}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    LinkedIn URL
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinLink}
                    onChange={(e) =>
                      setLinkedinLink(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

              {/* Portfolio */}

              <Col md={4}>

                <Form.Group>

                  <Form.Label
                    className="small fw-semibold"
                    style={labelStyle}
                  >
                    Portfolio Website
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="https://myportfolio.dev"
                    value={portfolioLink}
                    onChange={(e) =>
                      setPortfolioLink(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />

                </Form.Group>

              </Col>

            </Row>

          </Card>

          {/* =================================================
              SKILLS
          ================================================= */}

          <Card
            className="p-4 border-0 rounded-4 mb-4"
            style={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
            }}
          >

            <h5
              className="fw-bold mb-3"
              style={{ color: "#f8fafc" }}
            >
              Manage Skills
            </h5>

            {/* =================================================
                TEACH SKILLS
            ================================================= */}

            <div
              className="p-3 rounded-3 mb-4"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
              }}
            >

              <div className="d-flex justify-content-between align-items-center mb-2">

                <Form.Label
                  className="small fw-bold text-uppercase mb-0"
                  style={{
                    color: "#38bdf8",
                  }}
                >
                  Skills I Can Teach (
                  {teachSkills.length}
                  )
                </Form.Label>

                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.72rem",
                  }}
                >
                  Verified status is preserved
                  automatically
                </span>

              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">

                {teachSkills.map(
                  (sk, idx) => {

                    const sName =
                      typeof sk === "string"
                        ? sk
                        : sk.name;

                    const sStatus =
                      typeof sk === "object"
                        ? sk.status
                        : "Claimed";

                    return (
                      <Badge
                        key={idx}
                        bg="dark"
                        className="border border-info text-info d-flex align-items-center gap-2 px-3 py-2 rounded-pill fs-6"
                      >

                        <span>
                          {sName}
                        </span>

                        {sStatus &&
                          sStatus.includes(
                            "Verified"
                          ) && (
                            <span className="text-success fw-bold">
                              ✓
                            </span>
                          )}

                        <FaTimes
                          size={12}
                          className="cursor-pointer text-muted ms-1"
                          onClick={() =>
                            handleRemoveTeachSkill(
                              sName
                            )
                          }
                        />

                      </Badge>
                    );
                  }
                )}

              </div>

              <Row className="g-2">

                <Col md={6}>

                  <Form.Select
                    value={newTeachSkill}
                    onChange={(e) => {
                      setNewTeachSkill(
                        e.target.value
                      );

                      if (e.target.value) {
                        setNewTeachCat(
                          getSkillCategory(
                            e.target.value
                          )
                        );
                      }
                    }}
                    style={selectStyle}
                  >

                    <option
                      value=""
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#94a3b8",
                      }}
                    >
                      Choose a skill to teach...
                    </option>

                    {availableSkillsList.map(
                      (s, i) => (
                        <option
                          key={i}
                          value={s}
                          style={{
                            backgroundColor:
                              "#0f172a",
                            color: "#f8fafc",
                          }}
                        >
                          {s}
                        </option>
                      )
                    )}

                  </Form.Select>

                </Col>

                <Col md={4}>

                  <Form.Select
                    value={newTeachCat}
                    onChange={(e) =>
                      setNewTeachCat(
                        e.target.value
                      )
                    }
                    style={selectStyle}
                  >

                    {CATEGORIES.filter(
                      (c) =>
                        c.id !== "all"
                    ).map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.name}
                        style={{
                          backgroundColor:
                            "#0f172a",
                          color: "#f8fafc",
                        }}
                      >
                        {cat.name}
                      </option>
                    ))}

                  </Form.Select>

                </Col>

                <Col md={2}>

                  <Button
                    variant="info"
                    className="w-100 text-dark fw-semibold"
                    onClick={
                      handleAddTeachSkill
                    }
                  >
                    <FaPlus /> Add
                  </Button>

                </Col>

              </Row>

            </div>

            {/* =================================================
                LEARN SKILLS
            ================================================= */}

            <div
              className="p-3 rounded-3"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
              }}
            >

              <Form.Label
                className="small fw-bold text-uppercase d-block mb-2"
                style={{
                  color: "#fbbf24",
                }}
              >
                Skills I Want to Learn (
                {learnSkills.length}
                )
              </Form.Label>

              <div className="d-flex flex-wrap gap-2 mb-3">

                {learnSkills.map(
                  (sk, idx) => {

                    const sName =
                      typeof sk === "string"
                        ? sk
                        : sk.name;

                    return (
                      <Badge
                        key={idx}
                        bg="dark"
                        className="border border-warning text-warning d-flex align-items-center gap-2 px-3 py-2 rounded-pill fs-6"
                      >

                        <span>
                          {sName}
                        </span>

                        <FaTimes
                          size={12}
                          className="cursor-pointer text-muted ms-1"
                          onClick={() =>
                            handleRemoveLearnSkill(
                              sName
                            )
                          }
                        />

                      </Badge>
                    );
                  }
                )}

              </div>

              <Row className="g-2">

                <Col md={6}>

                  <Form.Select
                    value={newLearnSkill}
                    onChange={(e) => {
                      setNewLearnSkill(
                        e.target.value
                      );

                      if (e.target.value) {
                        setNewLearnCat(
                          getSkillCategory(
                            e.target.value
                          )
                        );
                      }
                    }}
                    style={selectStyle}
                  >

                    <option
                      value=""
                      style={{
                        backgroundColor:
                          "#0f172a",
                        color: "#94a3b8",
                      }}
                    >
                      Choose a skill to learn...
                    </option>

                    {availableSkillsList.map(
                      (s, i) => (
                        <option
                          key={i}
                          value={s}
                          style={{
                            backgroundColor:
                              "#0f172a",
                            color: "#f8fafc",
                          }}
                        >
                          {s}
                        </option>
                      )
                    )}

                  </Form.Select>

                </Col>

                <Col md={4}>

                  <Form.Select
                    value={newLearnCat}
                    onChange={(e) =>
                      setNewLearnCat(
                        e.target.value
                      )
                    }
                    style={selectStyle}
                  >

                    {CATEGORIES.filter(
                      (c) =>
                        c.id !== "all"
                    ).map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.name}
                        style={{
                          backgroundColor:
                            "#0f172a",
                          color: "#f8fafc",
                        }}
                      >
                        {cat.name}
                      </option>
                    ))}

                  </Form.Select>

                </Col>

                <Col md={2}>

                  <Button
                    variant="warning"
                    className="w-100 text-dark fw-semibold"
                    onClick={
                      handleAddLearnSkill
                    }
                  >
                    <FaPlus /> Add
                  </Button>

                </Col>

              </Row>

            </div>

          </Card>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="d-flex justify-content-end gap-3">

            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => navigate(-1)}
              className="px-4 text-light"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="lg"
              className="px-5 border-0 text-dark fw-bold d-flex align-items-center gap-2"
              style={{
                backgroundColor: "#3bb4a1",
              }}
              disabled={saving}
            >

              {saving ? (
                <Spinner
                  animation="border"
                  size="sm"
                />
              ) : (
                <FaSave />
              )}

              <span>
                Save Changes
              </span>

            </Button>

          </div>

        </Form>
      </Container>
    </div>
  );
};

export default EditProfile;