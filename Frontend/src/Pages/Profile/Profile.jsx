import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";

import {
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaComments,
  FaUserPlus,
  FaClock,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaEdit,
  FaCheckCircle,
  FaAward,
  FaGraduationCap,
  FaLaptopCode,
  FaExchangeAlt,
} from "react-icons/fa";

import { useUser } from "../../util/UserContext";

import SkillBadge from "../../Components/SkillBadge";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import RatingModal from "../../Components/RatingModal";

import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { username: paramUsername } = useParams();

  const { user: currentUser } = useUser();

  const navigate = useNavigate();

  // =========================================================
  // DETERMINE WHICH PROFILE WE ARE VIEWING
  // =========================================================

  const targetUsername =
    paramUsername || currentUser?.username;

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  const [showRatingModal, setShowRatingModal] =
    useState(false);

  // =========================================================
  // CHECK IF CURRENT USER OWNS THIS PROFILE
  // =========================================================

  const isOwner =
    currentUser &&
    profileUser &&
    currentUser.username?.toLowerCase() ===
      profileUser.username?.toLowerCase();

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  const fetchProfile = async () => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let response;

      if (!paramUsername) {
        response = await axios.get("/user/me");
      } else {
        response = await axios.get(
          `/user/registered/getDetails/${paramUsername}`
        );
      }

      if (response?.data?.data) {
        setProfileUser(response.data.data);
      } else {
        setProfileUser(null);
      }
    } catch (err) {
      console.log("Error loading profile:", err);

      toast.error(
        err?.response?.data?.message ||
          "User profile not found."
      );

      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    fetchProfile();
  }, [targetUsername, paramUsername]);

  // =========================================================
  // CONNECT WITH USER
  // =========================================================

  const handleConnect = async () => {
    if (!profileUser?._id) return;

    try {
      setConnectLoading(true);

      const { data } = await axios.post(
        "/request/create",
        {
          receiverID: profileUser._id,
        }
      );

      setProfileUser((prev) => ({
        ...prev,
        connectionStatus: "Pending",
        status: "Pending",
      }));

      toast.success(
        data?.message ||
          "Connection request sent!"
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to send request."
      );
    } finally {
      setConnectLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "85vh",
          backgroundColor: "#0b1120",
        }}
      >
        <Spinner
          animation="border"
          style={{ color: "#3bb4a1" }}
        />
      </div>
    );
  }

  // =========================================================
  // USER NOT FOUND
  // =========================================================

  if (!profileUser) {
    return (
      <div
        className="text-center py-5"
        style={{
          minHeight: "85vh",
          backgroundColor: "#0b1120",
          color: "#ffffff",
        }}
      >
        <h3 style={{ color: "#ffffff" }}>
          User not found
        </h3>

        <Button
          as={Link}
          to="/discover"
          variant="outline-info"
          className="mt-3"
        >
          Back to Discover
        </Button>
      </div>
    );
  }

  // =========================================================
  // PROFILE DATA
  // =========================================================

  const teachingSkills =
    profileUser.skillsProficientAt || [];

  const learningSkills =
    profileUser.skillsToLearn || [];

  const reviews =
    profileUser.reviews || [];

  const education =
    profileUser.education || [];

  const projects =
    profileUser.projects || [];

  // =========================================================
  // COMMON STYLES
  // =========================================================

  const cardStyle = {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#ffffff",
  };

  const primaryText = {
    color: "#ffffff",
  };

  const secondaryText = {
    color: "#e2e8f0",
  };

  const mutedText = {
    color: "#cbd5e1",
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        color: "#ffffff",
        minHeight: "92vh",
        paddingBottom: "4rem",
      }}
    >
      <Container className="py-4">

        {/* =====================================================
            PROFILE HEADER
        ====================================================== */}

        <Card
          className="p-4 p-md-5 border-0 rounded-4 shadow-lg mb-4"
          style={cardStyle}
        >
          <Row className="align-items-center g-4">

            {/* PROFILE IMAGE */}

            <Col
              xs={12}
              md="auto"
              className="text-center text-md-start"
            >
              <img
                src={
                  profileUser.picture ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250"
                }
                alt={profileUser.name}
                className="rounded-circle shadow-lg"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  border: "4px solid #475569",
                }}
              />
            </Col>

            {/* BASIC INFORMATION */}

            <Col
              xs={12}
              md
              className="text-center text-md-start"
            >
              <div
                className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1"
              >
                <h2
                  className="fw-bold mb-0"
                  style={{
                    ...primaryText,
                    fontFamily:
                      "'Josefin Sans', sans-serif",
                  }}
                >
                  {profileUser.name}
                </h2>

                <span
                  className="fs-6"
                  style={secondaryText}
                >
                  @{profileUser.username}
                </span>

                {profileUser.experienceLevel && (
                  <Badge
                    className="px-2 py-1 rounded-pill small"
                    style={{
                      backgroundColor: "#3bb4a1",
                      color: "#07111f",
                    }}
                  >
                    {profileUser.experienceLevel}
                  </Badge>
                )}
              </div>

              {/* LOCATION + AVAILABILITY */}

              <div
                className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3 small mb-3"
                style={secondaryText}
              >
                {profileUser.location && (
                  <span className="d-flex align-items-center gap-1">
                    <FaMapMarkerAlt
                      style={{ color: "#38bdf8" }}
                    />
                    {profileUser.location}
                  </span>
                )}

                {profileUser.availability && (
                  <span className="d-flex align-items-center gap-1">
                    <FaCalendarAlt
                      style={{ color: "#38bdf8" }}
                    />

                    <span>
                      <strong style={primaryText}>
                        Availability:
                      </strong>{" "}
                      {profileUser.availability}
                    </span>
                  </span>
                )}
              </div>

              {/* STATS */}

              <div
                className="d-flex flex-wrap justify-content-center justify-content-md-start gap-4 pt-2 border-top border-secondary border-opacity-25"
              >
                <div className="d-flex align-items-center gap-1">
                  <FaStar
                    className="text-warning"
                    size={16}
                  />

                  <span
                    className="fw-bold fs-5"
                    style={primaryText}
                  >
                    {(profileUser.rating || 5).toFixed(1)}
                  </span>

                  <span
                    className="small"
                    style={secondaryText}
                  >
                    ({reviews.length} reviews)
                  </span>
                </div>

                <div>
                  <span
                    className="fw-bold fs-5"
                    style={primaryText}
                  >
                    {profileUser.completedSessions || 0}
                  </span>

                  <span
                    className="small ms-1"
                    style={secondaryText}
                  >
                    Sessions Completed
                  </span>
                </div>

                <div>
                  <span
                    className="fw-bold fs-5"
                    style={primaryText}
                  >
                    {profileUser.connectionsCount || 0}
                  </span>

                  <span
                    className="small ms-1"
                    style={secondaryText}
                  >
                    Connections
                  </span>
                </div>
              </div>
            </Col>

            {/* ACTIONS */}

            <Col
              xs={12}
              lg="auto"
              className="d-flex flex-column align-items-center align-items-lg-end gap-3"
            >
              {isOwner ? (
                <div className="d-flex gap-2">

                  {/* EDIT PROFILE */}

                  <Button
                    as={Link}
                    to="/edit_profile"
                    variant="outline-info"
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold"
                  >
                    <FaEdit />
                    Edit Profile
                  </Button>

                  {/* VERIFY SKILLS */}

                  <Button
                    as={Link}
                    to="/verify"
                    className="border-0 fw-semibold d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    style={{
                      backgroundColor: "#3bb4a1",
                      color: "#07111f",
                    }}
                  >
                    <FaCheckCircle />
                    Verify Skills
                  </Button>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2 justify-content-center">

                  {/* CONNECTED */}

                  {profileUser.connectionStatus ===
                  "Connected" ? (
                    <>
                      <Button
                        as={Link}
                        to="/chats"
                        size="md"
                        className="border-0 fw-semibold d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{
                          backgroundColor:
                            "#3bb4a1",
                          color: "#07111f",
                        }}
                      >
                        <FaComments />
                        Message
                      </Button>

                      <Button
                        variant="outline-warning"
                        size="md"
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{
                          color: "#facc15",
                        }}
                        onClick={() =>
                          setShowScheduleModal(true)
                        }
                      >
                        <FaCalendarAlt />
                        Schedule Session
                      </Button>

                      <Button
                        variant="outline-success"
                        size="md"
                        className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        style={{
                          color: "#4ade80",
                        }}
                        onClick={() =>
                          setShowRatingModal(true)
                        }
                      >
                        <FaStar />
                        Rate
                      </Button>
                    </>
                  ) : profileUser.connectionStatus ===
                    "Pending" ? (

                    /* PENDING */

                    <Button
                      disabled
                      className="px-4 py-2 rounded-3 border-0"
                      style={{
                        backgroundColor: "#475569",
                        color: "#ffffff",
                      }}
                    >
                      <FaClock className="me-1" />
                      Request Pending
                    </Button>

                  ) : (

                    /* NOT CONNECTED */

                    <Button
                      className="border-0 fw-semibold d-flex align-items-center gap-2 px-4 py-2 rounded-3"
                      style={{
                        backgroundColor:
                          "#3bb4a1",
                        color: "#07111f",
                      }}
                      onClick={handleConnect}
                      disabled={connectLoading}
                    >
                      <FaUserPlus />

                      {connectLoading
                        ? "Sending..."
                        : "Connect"}
                    </Button>
                  )}
                </div>
              )}

              {/* SOCIAL LINKS */}

              <div className="d-flex gap-2 mt-1">

                {profileUser.githubLink && (
                  <a
                    href={
                      profileUser.githubLink.startsWith(
                        "http"
                      )
                        ? profileUser.githubLink
                        : `https://${profileUser.githubLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm p-2 rounded-circle"
                    style={{ color: "#ffffff" }}
                    title="GitHub Profile"
                  >
                    <FaGithub size={16} />
                  </a>
                )}

                {profileUser.linkedinLink && (
                  <a
                    href={
                      profileUser.linkedinLink.startsWith(
                        "http"
                      )
                        ? profileUser.linkedinLink
                        : `https://${profileUser.linkedinLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm p-2 rounded-circle"
                    style={{ color: "#38bdf8" }}
                    title="LinkedIn Profile"
                  >
                    <FaLinkedin size={16} />
                  </a>
                )}

                {profileUser.portfolioLink && (
                  <a
                    href={
                      profileUser.portfolioLink.startsWith(
                        "http"
                      )
                        ? profileUser.portfolioLink
                        : `https://${profileUser.portfolioLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm p-2 rounded-circle"
                    style={{ color: "#facc15" }}
                    title="Personal Portfolio"
                  >
                    <FaGlobe size={16} />
                  </a>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* =====================================================
            BIO
        ====================================================== */}

        {profileUser.bio && (
          <Card
            className="p-4 border-0 rounded-4 mb-4"
            style={cardStyle}
          >
            <h5
              className="fw-bold mb-2"
              style={primaryText}
            >
              About Me
            </h5>

            <p
              className="mb-0 fs-6"
              style={{
                lineHeight: "1.6",
                color: "#e2e8f0",
              }}
            >
              {profileUser.bio}
            </p>
          </Card>
        )}

        {/* =====================================================
            SKILLS
        ====================================================== */}

        <Row className="g-4 mb-4">

          {/* TEACHING SKILLS */}

          <Col md={6}>
            <Card
              className="h-100 p-4 border-0 rounded-4"
              style={cardStyle}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5
                  className="fw-bold mb-0 d-flex align-items-center gap-2"
                  style={primaryText}
                >
                  <FaAward
                    style={{ color: "#38bdf8" }}
                  />
                  Skills I Can Teach
                </h5>

                <span
                  className="small"
                  style={secondaryText}
                >
                  {teachingSkills.length} Listed
                </span>
              </div>

              {teachingSkills.length === 0 ? (
                <div
                  className="small py-3 text-center"
                  style={secondaryText}
                >
                  No teaching skills listed yet.
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {teachingSkills.map(
                    (sk, idx) => (
                      <SkillBadge
                        key={idx}
                        skill={sk}
                        isOwner={isOwner}
                        onVerify={(sName) =>
                          navigate(
                            `/verify?skill=${encodeURIComponent(
                              sName
                            )}`
                          )
                        }
                        onAddPortfolio={(sName) =>
                          navigate(
                            `/verify?skill=${encodeURIComponent(
                              sName
                            )}&tab=github`
                          )
                        }
                        size="md"
                      />
                    )
                  )}
                </div>
              )}

              {isOwner && (
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <span
                    className="small d-block"
                    style={secondaryText}
                  >
                    💡 Click "Verify Test" to take an
                    assessment or "GitHub Repo" to add
                    portfolio evidence!
                  </span>
                </div>
              )}
            </Card>
          </Col>

          {/* LEARNING SKILLS */}

          <Col md={6}>
            <Card
              className="h-100 p-4 border-0 rounded-4"
              style={cardStyle}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">

                <h5
                  className="fw-bold mb-0 d-flex align-items-center gap-2"
                  style={primaryText}
                >
                  <FaExchangeAlt
                    style={{ color: "#facc15" }}
                  />
                  Skills I Want to Learn
                </h5>

                <span
                  className="small"
                  style={secondaryText}
                >
                  {learningSkills.length} Listed
                </span>
              </div>

              {learningSkills.length === 0 ? (
                <div
                  className="small py-3 text-center"
                  style={secondaryText}
                >
                  No learning goals listed yet.
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {learningSkills.map(
                    (sk, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 rounded-pill fs-6 fw-normal border"
                        style={{
                          backgroundColor: "#0f172a",
                          color: "#facc15",
                          borderColor: "#475569",
                        }}
                      >
                        {typeof sk === "string"
                          ? sk
                          : sk.name}
                      </span>
                    )
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* =====================================================
            EDUCATION + PROJECTS
        ====================================================== */}

        {(education.length > 0 ||
          projects.length > 0) && (
          <Row className="g-4 mb-4">

            {/* EDUCATION */}

            {education.length > 0 && (
              <Col
                md={
                  projects.length > 0
                    ? 6
                    : 12
                }
              >
                <Card
                  className="h-100 p-4 border-0 rounded-4"
                  style={cardStyle}
                >
                  <h5
                    className="fw-bold mb-3 d-flex align-items-center gap-2"
                    style={primaryText}
                  >
                    <FaGraduationCap
                      style={{ color: "#60a5fa" }}
                    />
                    Education & Background
                  </h5>

                  <div className="d-flex flex-column gap-3">

                    {education.map(
                      (edu, i) => (
                        <div
                          key={
                            edu._id || i
                          }
                          className="p-3 rounded-3"
                          style={{
                            backgroundColor:
                              "#0f172a",
                            border:
                              "1px solid #334155",
                          }}
                        >
                          <div
                            className="fw-bold"
                            style={primaryText}
                          >
                            {edu.institution ||
                              "Institution"}
                          </div>

                          {edu.degree && (
                            <div
                              className="small"
                              style={{
                                color: "#38bdf8",
                              }}
                            >
                              {edu.degree}
                            </div>
                          )}

                          {edu.score !==
                            undefined &&
                            edu.score !==
                              null &&
                            edu.score !== 0 && (
                              <div
                                className="small mt-1"
                                style={secondaryText}
                              >
                                <strong
                                  style={primaryText}
                                >
                                  Score:
                                </strong>{" "}
                                {edu.score}
                              </div>
                            )}

                          {edu.description && (
                            <div
                              className="small mt-1"
                              style={{
                                color: "#e2e8f0",
                              }}
                            >
                              {edu.description}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </Col>
            )}

            {/* PROJECTS */}

            {projects.length > 0 && (
              <Col
                md={
                  education.length > 0
                    ? 6
                    : 12
                }
              >
                <Card
                  className="h-100 p-4 border-0 rounded-4"
                  style={cardStyle}
                >
                  <h5
                    className="fw-bold mb-3 d-flex align-items-center gap-2"
                    style={primaryText}
                  >
                    <FaLaptopCode
                      style={{ color: "#4ade80" }}
                    />
                    Featured Projects
                  </h5>

                  <div className="d-flex flex-column gap-3">

                    {projects.map(
                      (project, i) => (
                        <div
                          key={
                            project._id ||
                            i
                          }
                          className="p-3 rounded-3"
                          style={{
                            backgroundColor:
                              "#0f172a",
                            border:
                              "1px solid #334155",
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-2">

                            <div
                              className="fw-bold"
                              style={primaryText}
                            >
                              {project.title ||
                                "Untitled Project"}
                            </div>

                            {project.projectLink && (
                              <a
                                href={
                                  project.projectLink.startsWith(
                                    "http"
                                  )
                                    ? project.projectLink
                                    : `https://${project.projectLink}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="small text-decoration-none"
                                style={{
                                  color: "#38bdf8",
                                }}
                              >
                                Link ↗
                              </a>
                            )}
                          </div>

                          {project.description && (
                            <div
                              className="small mt-1"
                              style={{
                                color: "#e2e8f0",
                              }}
                            >
                              {
                                project.description
                              }
                            </div>
                          )}

                          {project.techStack &&
                            project.techStack.length >
                              0 && (
                              <div className="d-flex flex-wrap gap-1 mt-2">
                                {project.techStack.map(
                                  (
                                    tech,
                                    techIndex
                                  ) => (
                                    <Badge
                                      key={
                                        techIndex
                                      }
                                      className="border"
                                      style={{
                                        backgroundColor:
                                          "#172033",
                                        color:
                                          "#38bdf8",
                                        borderColor:
                                          "#475569",
                                      }}
                                    >
                                      {tech}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* =====================================================
            REVIEWS
        ====================================================== */}

        <Card
          className="p-4 p-md-5 border-0 rounded-4"
          style={cardStyle}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h4
                className="fw-bold mb-1 d-flex align-items-center gap-2"
                style={primaryText}
              >
                <FaStar className="text-warning" />
                Peer Ratings & Verified Feedback
              </h4>

              <span
                className="small"
                style={secondaryText}
              >
                Credibility and learning experience
                reviews from connected peers
              </span>
            </div>

            {!isOwner &&
              profileUser.connectionStatus ===
                "Connected" && (
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="d-flex align-items-center gap-1 rounded-3 px-3 py-2"
                  style={{
                    color: "#facc15",
                  }}
                  onClick={() =>
                    setShowRatingModal(true)
                  }
                >
                  <FaStar />
                  Write a Review
                </Button>
              )}
          </div>

          {/* NO REVIEWS */}

          {reviews.length === 0 ? (
            <div
              className="text-center py-5 border border-secondary border-opacity-25 rounded-4"
              style={{
                backgroundColor: "#172033",
              }}
            >
              <FaStar
                size={36}
                className="text-warning mb-3"
                style={{ opacity: 0.8 }}
              />

              <h6
                className="fw-semibold mb-2"
                style={primaryText}
              >
                No reviews yet
              </h6>

              <p
                className="small mb-0"
                style={secondaryText}
              >
                Reviews will appear here after
                completing peer learning sessions.
              </p>
            </div>
          ) : (

            /* REVIEWS */

            <div className="d-flex flex-column gap-3">

              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-3 rounded-3 border border-secondary border-opacity-25"
                  style={{
                    backgroundColor:
                      "#0f172a",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">

                    <div className="d-flex align-items-center gap-2">

                      <img
                        src={
                          review.rater?.picture ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80"
                        }
                        alt={
                          review.rater?.name ||
                          "Peer"
                        }
                        className="rounded-circle"
                        style={{
                          width: "38px",
                          height: "38px",
                          objectFit: "cover",
                        }}
                      />

                      <div>
                        <div
                          className="fw-bold small"
                          style={primaryText}
                        >
                          {review.rater?.name ||
                            "Anonymous Peer"}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "0.72rem",
                            color: "#cbd5e1",
                          }}
                        >
                          @
                          {
                            review.rater
                              ?.username
                          }
                        </div>
                      </div>
                    </div>

                    <div className="text-end">

                      <div className="text-warning small d-flex align-items-center gap-1">
                        {Array.from({
                          length:
                            review.rating ||
                            5,
                        }).map(
                          (_, i) => (
                            <FaStar
                              key={i}
                              size={13}
                            />
                          )
                        )}
                      </div>

                      <span
                        style={{
                          fontSize:
                            "0.7rem",
                          color: "#cbd5e1",
                        }}
                      >
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                  </div>

                  <Badge
                    className="border mb-2 small"
                    style={{
                      backgroundColor:
                        "#172033",
                      color: "#38bdf8",
                      borderColor:
                        "#475569",
                    }}
                  >
                    Skill:{" "}
                    {review.skill}
                  </Badge>

                  <p
                    className="small mb-0"
                    style={{
                      lineHeight: "1.5",
                      color: "#e2e8f0",
                    }}
                  >
                    "{review.description}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Container>

      {/* =====================================================
          SCHEDULE SESSION MODAL
      ====================================================== */}

      <ScheduleSessionModal
        show={showScheduleModal}
        onHide={() =>
          setShowScheduleModal(false)
        }
        partner={profileUser}
        onSessionScheduled={fetchProfile}
      />

      {/* =====================================================
          RATING MODAL
      ====================================================== */}

      <RatingModal
        show={showRatingModal}
        onHide={() =>
          setShowRatingModal(false)
        }
        targetUser={profileUser}
        onRatingSubmitted={fetchProfile}
      />
    </div>
  );
};

export default Profile;