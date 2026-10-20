import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import {
  FaExchangeAlt,
  FaUserFriends,
  FaCheckCircle,
  FaCalendarAlt,
  FaStar,
  FaArrowRight,
  FaVideo,
  FaCheck,
  FaTimes,
  FaComments,
  FaGithub,
  FaAward,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import SkillBadge from "../../Components/SkillBadge";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import RatingModal from "../../Components/RatingModal";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recommendedPeers, setRecommendedPeers] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingSessions, setIncomingSessions] = useState([]);

  const [selectedPartnerForSession, setSelectedPartnerForSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const [selectedSessionForRating, setSelectedSessionForRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [discoverRes, sessionRes, reqRes] = await Promise.all([
        axios.get("/user/discover"),
        axios.get("/sessions/mySessions"),
        axios.get("/request/getRequests"),
      ]);

      if (discoverRes?.data?.data) {
        setRecommendedPeers(discoverRes.data.data.forYou?.slice(0, 4) || []);
      }

      if (sessionRes?.data?.data) {
        setUpcomingSessions(sessionRes.data.data.upcoming || []);
        setIncomingSessions(
          (sessionRes.data.data.pendingRequests || []).filter(
            (s) => s.createdBy?._id !== user?._id
          )
        );
      }

      if (reqRes?.data?.data) {
        setPendingRequests(reqRes.data.data || []);
      }
    } catch (err) {
      console.log("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post("/request/acceptRequest", { requestId });
      toast.success("Connection request accepted!");
      fetchDashboardData();
      refreshUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post("/request/rejectRequest", { requestId });
      toast.info("Connection request declined.");
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to decline request.");
    }
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      await axios.put(`/sessions/accept/${sessionId}`);
      toast.success("Session accepted!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept session.");
    }
  };

  const handleCompleteSession = async (session) => {
    try {
      await axios.put(`/sessions/complete/${session._id}`);
      toast.success("Session marked as completed!");
      fetchDashboardData();
      refreshUser();

      const otherUser =
        session.teacher?._id === user?._id ? session.learner : session.teacher;
      setSelectedSessionForRating(session);
      setSelectedPartnerForSession(otherUser);
      setShowRatingModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete session.");
    }
  };

  const teachingSkills = user?.skillsProficientAt || [];
  const verifiedSkillsCount = teachingSkills.filter(
    (s) => s.status && s.status.includes("Verified")
  ).length;

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        color: "#f8fafc",
        minHeight: "92vh",
        paddingBottom: "3rem",
      }}
    >
      <Container className="py-4">

        {/* Welcome Banner */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-25 gap-3">
          <div>
            <h2
              className="fw-bold text-light mb-1"
              style={{ fontFamily: "'Josefin Sans', sans-serif" }}
            >
              Welcome back, {user?.name || "Friend"} 👋
            </h2>

            {/* CHANGED ONLY COLOR */}
            <p className="small mb-0" style={{ color: "#cbd5e1" }}>
              Here is your peer learning exchange overview and recommendations for today.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button
              as={Link}
              to="/verify"
              variant="outline-info"
              size="sm"
              className="px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-1"
            >
              <FaCheckCircle /> Take Skill Assessment
            </Button>

            <Button
              as={Link}
              to="/discover"
              size="sm"
              className="px-3 py-2 rounded-3 fw-semibold border-0 text-dark d-flex align-items-center gap-1"
              style={{ backgroundColor: "#3bb4a1" }}
            >
              <FaExchangeAlt /> Find Peers
            </Button>
          </div>
        </div>

        {/* User Stats Row */}
        <Row className="g-3 mb-4">

          <Col xs={6} lg={3}>
            <Card
              className="p-3 border-0 rounded-4 shadow-sm"
              style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {/* CHANGED ONLY COLOR */}
                  <div
                    className="small text-uppercase fw-bold"
                    style={{ color: "#94a3b8" }}
                  >
                    Connections
                  </div>
                  <div className="fs-3 fw-bold text-light">
                    {user?.connectionsCount || 0}
                  </div>
                </div>

                <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                  <FaUserFriends size={22} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card
              className="p-3 border-0 rounded-4 shadow-sm"
              style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div
                    className="small text-uppercase fw-bold"
                    style={{ color: "#94a3b8" }}
                  >
                    Teaching Skills
                  </div>
                  <div className="fs-3 fw-bold text-light">
                    {teachingSkills.length}
                  </div>
                </div>

                <div className="p-2 rounded-circle bg-teal bg-opacity-10 text-info">
                  <FaExchangeAlt size={22} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card
              className="p-3 border-0 rounded-4 shadow-sm"
              style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div
                    className="small text-uppercase fw-bold"
                    style={{ color: "#94a3b8" }}
                  >
                    Verified Badges
                  </div>
                  <div className="fs-3 fw-bold text-success">
                    {verifiedSkillsCount}
                  </div>
                </div>

                <div className="p-2 rounded-circle bg-success bg-opacity-10 text-success">
                  <FaAward size={22} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={6} lg={3}>
            <Card
              className="p-3 border-0 rounded-4 shadow-sm"
              style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div
                    className="small text-uppercase fw-bold"
                    style={{ color: "#94a3b8" }}
                  >
                    Completed Sessions
                  </div>
                  <div className="fs-3 fw-bold text-warning">
                    {user?.completedSessions || 0}
                  </div>
                </div>

                <div className="p-2 rounded-circle bg-warning bg-opacity-10 text-warning">
                  <FaCalendarAlt size={22} />
                </div>
              </div>
            </Card>
          </Col>

        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : (
          <Row className="g-4">

            {/* Left Column */}
            <Col lg={8}>

              {/* Mutual Match Radar */}
              <Card
                className="p-4 border-0 rounded-4 mb-4"
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold text-light mb-0 d-flex align-items-center gap-2">
                      <FaExchangeAlt className="text-info" />
                      Recommended Peer Swaps
                    </h5>

                    {/* CHANGED ONLY COLOR */}
                    <span className="small" style={{ color: "#cbd5e1" }}>
                      Peers matched to your learning interests with mutual compatibility
                    </span>
                  </div>

                  <Link
                    to="/discover"
                    className="text-info small text-decoration-none fw-semibold"
                  >
                    View All ↗
                  </Link>
                </div>

                {recommendedPeers.length === 0 ? (
                  /* CHANGED ONLY COLOR */
                  <div
                    className="p-4 text-center"
                    style={{ color: "#cbd5e1" }}
                  >
                    No mutual recommendations found. Try exploring the Discover feed or adding more skills!
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {recommendedPeers.map((peer) => (
                      <div
                        key={peer._id}
                        className="p-3 rounded-3 border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                        style={{ backgroundColor: "#0f172a" }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              peer.picture ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            }
                            alt={peer.name}
                            className="rounded-circle"
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "cover",
                            }}
                          />

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <Link
                                to={`/profile/${peer.username}`}
                                className="fw-bold text-light text-decoration-none hover-underline"
                              >
                                {peer.name}
                              </Link>

                              {peer.isMutualMatch && (
                                <Badge
                                  bg="success"
                                  pill
                                  style={{ fontSize: "0.68rem" }}
                                >
                                  Mutual Match
                                </Badge>
                              )}

                              <Badge
                                bg="dark"
                                className="border border-secondary"
                                style={{ fontSize: "0.68rem" }}
                              >
                                {peer.matchScore}% Match
                              </Badge>
                            </div>

                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {(peer.skillsProficientAt || [])
                                .slice(0, 3)
                                .map((sk, idx) => (
                                  <SkillBadge
                                    key={idx}
                                    skill={sk}
                                    size="sm"
                                  />
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-2 align-self-end align-self-md-center">
                          <Button
                            as={Link}
                            to={`/profile/${peer.username}`}
                            variant="outline-secondary"
                            size="sm"
                            className="text-light"
                          >
                            Profile
                          </Button>

                          <Button
                            as={Link}
                            to="/chats"
                            size="sm"
                            className="border-0 text-dark fw-semibold"
                            style={{ backgroundColor: "#3bb4a1" }}
                          >
                            <FaComments className="me-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Upcoming Learning Sessions */}
              <Card
                className="p-4 border-0 rounded-4"
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold text-light mb-0 d-flex align-items-center gap-2">
                      <FaCalendarAlt className="text-warning" />
                      Upcoming Learning Sessions
                    </h5>

                    {/* CHANGED ONLY COLOR */}
                    <span className="small" style={{ color: "#cbd5e1" }}>
                      Your scheduled peer sessions
                    </span>
                  </div>

                  <Link
                    to="/sessions"
                    className="text-info small text-decoration-none fw-semibold"
                  >
                    Manage Sessions ↗
                  </Link>
                </div>

                {upcomingSessions.length === 0 ? (
                  /* CHANGED ONLY COLOR */
                  <div
                    className="p-4 text-center border border-secondary border-opacity-25 rounded-3"
                    style={{ color: "#cbd5e1" }}
                  >
                    No upcoming sessions scheduled. Connect with a peer to arrange a 1-on-1 session!
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {upcomingSessions.map((s) => {
                      const otherUser =
                        s.teacher?._id === user?._id
                          ? s.learner
                          : s.teacher;

                      const isTeacher = s.teacher?._id === user?._id;

                      return (
                        <div
                          key={s._id}
                          className="p-3 rounded-3 border border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                          style={{ backgroundColor: "#0f172a" }}
                        >
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <Badge bg="info" className="text-dark">
                                {s.skill}
                              </Badge>

                              <span className="fw-bold text-light">
                                {s.title}
                              </span>
                            </div>

                            {/* CHANGED ONLY COLOR */}
                            <div
                              className="small"
                              style={{ color: "#cbd5e1" }}
                            >
                              With{" "}
                              <strong style={{ color: "#f8fafc" }}>
                                {otherUser?.name}
                              </strong>{" "}
                              ({isTeacher
                                ? "You are teaching"
                                : "You are learning"})
                            </div>

                            {/* CHANGED ONLY COLOR */}
                            <div
                              className="small mt-1"
                              style={{ color: "#94a3b8" }}
                            >
                              📅 {s.date} at {s.time} • ⏱️ {s.duration} mins
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            {s.meetingLink && (
                              <Button
                                href={s.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                variant="outline-info"
                                className="d-flex align-items-center gap-1"
                              >
                                <FaVideo /> Join Link
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleCompleteSession(s)}
                              className="d-flex align-items-center gap-1"
                            >
                              <FaCheck /> Complete
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </Col>

            {/* Right Column */}
            <Col lg={4}>

              {/* Pending Connection Requests */}
              <Card
                className="p-4 border-0 rounded-4 mb-4"
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                }}
              >
                <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
                  <FaUserFriends className="text-success" />
                  Pending Requests
                </h5>

                {/* CHANGED ONLY COLOR */}
                <span
                  className="small d-block mb-3"
                  style={{ color: "#cbd5e1" }}
                >
                  Respond to incoming connection requests
                </span>

                {pendingRequests.length === 0 ? (
                  /* CHANGED ONLY COLOR */
                  <div
                    className="p-3 text-center small border border-secondary border-opacity-25 rounded-3"
                    style={{ color: "#cbd5e1" }}
                  >
                    No pending connection requests.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {pendingRequests.map((sender) => (
                      <div
                        key={sender._id}
                        className="p-2.5 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#0f172a" }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              sender.picture ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            }
                            alt={sender.name}
                            className="rounded-circle"
                            style={{
                              width: "36px",
                              height: "36px",
                              objectFit: "cover",
                            }}
                          />

                          <div>
                            <div className="fw-bold text-light small">
                              {sender.name}
                            </div>

                            {/* CHANGED ONLY COLOR */}
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "#94a3b8",
                              }}
                            >
                              @{sender.username}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="success"
                            className="p-1 rounded-circle"
                            style={{ width: "28px", height: "28px" }}
                            onClick={() => handleAcceptRequest(sender._id)}
                            title="Accept"
                          >
                            <FaCheck size={11} />
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            className="p-1 rounded-circle"
                            style={{ width: "28px", height: "28px" }}
                            onClick={() => handleRejectRequest(sender._id)}
                            title="Decline"
                          >
                            <FaTimes size={11} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Verification Progress Box */}
              <Card
                className="p-4 border-0 rounded-4"
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                }}
              >
                <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
                  <FaCheckCircle
                    className="text-teal"
                    style={{ color: "#3bb4a1" }}
                  />
                  Skill Verification
                </h5>

                {/* CHANGED ONLY COLOR */}
                <span
                  className="small d-block mb-3"
                  style={{ color: "#cbd5e1" }}
                >
                  Verified skills appear higher in peer search results
                </span>

                <div className="d-flex flex-column gap-2 mb-3">
                  {teachingSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-3 border border-secondary border-opacity-25 d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: "#0f172a" }}
                    >
                      <SkillBadge skill={sk} size="sm" />

                      {(!sk.status || sk.status === "Claimed") && (
                        <Button
                          as={Link}
                          to={`/verify?skill=${sk.name}`}
                          size="sm"
                          variant="outline-info"
                          className="py-0 px-2"
                          style={{ fontSize: "0.72rem" }}
                        >
                          Verify ↗
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  as={Link}
                  to="/verify"
                  variant="outline-light"
                  size="sm"
                  className="w-100 py-2 fw-semibold"
                >
                  Go to Verification Hub ↗
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Session Scheduling Modal */}
      {selectedPartnerForSession && (
        <ScheduleSessionModal
          show={showSessionModal}
          onHide={() => setShowSessionModal(false)}
          partner={selectedPartnerForSession}
          onSessionScheduled={fetchDashboardData}
        />
      )}

      {/* Rating & Review Modal */}
      {selectedPartnerForSession && selectedSessionForRating && (
        <RatingModal
          show={showRatingModal}
          onHide={() => setShowRatingModal(false)}
          targetUser={selectedPartnerForSession}
          session={selectedSessionForRating}
          onRatingSubmitted={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;