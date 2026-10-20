import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Nav, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaVideo,
  FaCheck,
  FaTimes,
  FaStar,
  FaClock,
  FaPlus,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import RatingModal from "../../Components/RatingModal";
import axios from "axios";
import { toast } from "react-toastify";

const Sessions = () => {
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [sessionsData, setSessionsData] = useState({
    upcoming: [],
    pendingRequests: [],
    completed: [],
    cancelled: [],
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPartnerForSchedule, setSelectedPartnerForSchedule] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState(null);
  const [selectedPartnerForRating, setSelectedPartnerForRating] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/sessions/mySessions");
      if (data?.data) {
        setSessionsData(data.data);
      }
    } catch (err) {
      console.log("Error loading sessions:", err);
      toast.error("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user?._id]);

  const handleAccept = async (sessionId) => {
    try {
      await axios.put(`/sessions/accept/${sessionId}`);
      toast.success("Session accepted!");
      fetchSessions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept session.");
    }
  };

  const handleReject = async (sessionId) => {
    try {
      await axios.put(`/sessions/reject/${sessionId}`);
      toast.info("Session request declined.");
      fetchSessions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to decline session.");
    }
  };

  const handleComplete = async (session) => {
    try {
      await axios.put(`/sessions/complete/${session._id}`);
      toast.success("Session marked as completed! Don't forget to leave a review.");
      fetchSessions();

      // Open rating modal
      const otherUser =
        session.teacher?._id === user?._id ? session.learner : session.teacher;
      setSelectedSessionForRating(session);
      setSelectedPartnerForRating(otherUser);
      setShowRatingModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete session.");
    }
  };

  const handleCancel = async (sessionId) => {
    try {
      await axios.put(`/sessions/cancel/${sessionId}`);
      toast.info("Session cancelled.");
      fetchSessions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel session.");
    }
  };

  const currentList =
    activeTab === "upcoming"
      ? sessionsData.upcoming
      : activeTab === "pending"
      ? sessionsData.pendingRequests
      : activeTab === "completed"
      ? sessionsData.completed
      : sessionsData.cancelled;

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "92vh", paddingBottom: "4rem" }}>
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              <FaCalendarAlt className="text-warning" /> Learning & Mentoring Sessions
            </h2>
            <p className="text-muted small mb-0">
              Schedule, track, and complete structured 1-on-1 knowledge exchange sessions.
            </p>
          </div>

          <Button
            className="border-0 text-dark fw-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3"
            style={{ backgroundColor: "#3bb4a1" }}
            onClick={() => {
              setSelectedPartnerForSchedule(null);
              setShowScheduleModal(true);
            }}
          >
            <FaPlus /> Schedule New Session
          </Button>
        </div>

        {/* Tabs */}
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3"
        >
          <Nav.Item>
            <Nav.Link
              eventKey="upcoming"
              className={`rounded-pill px-4 py-2 small fw-semibold d-flex align-items-center gap-2 ${
                activeTab === "upcoming" ? "bg-primary text-white" : "text-light bg-dark bg-opacity-50"
              }`}
            >
              <span>Upcoming</span>
              <Badge bg="info" pill className="text-dark">
                {sessionsData.upcoming.length}
              </Badge>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="pending"
              className={`rounded-pill px-4 py-2 small fw-semibold d-flex align-items-center gap-2 ${
                activeTab === "pending" ? "bg-warning text-dark" : "text-light bg-dark bg-opacity-50"
              }`}
            >
              <span>Pending Requests</span>
              {sessionsData.pendingRequests.length > 0 && (
                <Badge bg="danger" pill>
                  {sessionsData.pendingRequests.length}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="completed"
              className={`rounded-pill px-4 py-2 small fw-semibold d-flex align-items-center gap-2 ${
                activeTab === "completed" ? "bg-success text-white" : "text-light bg-dark bg-opacity-50"
              }`}
            >
              <span>Completed</span>
              <Badge bg="secondary" pill>
                {sessionsData.completed.length}
              </Badge>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="cancelled"
              className={`rounded-pill px-4 py-2 small fw-semibold ${
                activeTab === "cancelled" ? "bg-secondary text-white" : "text-light bg-dark bg-opacity-50"
              }`}
            >
              Past / Cancelled ({sessionsData.cancelled.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : currentList.length === 0 ? (
          <div
            className="p-5 text-center rounded-4 border border-secondary border-opacity-25 my-4"
            style={{ backgroundColor: "#1e293b" }}
          >
            <FaCalendarAlt size={40} className="text-muted mb-3" />
            <h5 className="fw-bold text-light">No sessions in this category</h5>
            <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "450px" }}>
              {activeTab === "upcoming"
                ? "You have no upcoming sessions scheduled. Request a session with a connected peer!"
                : "No session records found."}
            </p>
            {activeTab === "upcoming" && (
              <Button as={Link} to="/connections" variant="outline-info" size="sm" className="rounded-pill px-4 py-2">
                Go to Connected Peers
              </Button>
            )}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {currentList.map((session) => {
              const isTeacher = session.teacher?._id === user?._id;
              const otherUser = isTeacher ? session.learner : session.teacher;
              const isCreator = session.createdBy?._id === user?._id;

              return (
                <Card
                  key={session._id}
                  className="p-4 border border-secondary border-opacity-25 rounded-4 shadow-sm"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    {/* Session Info */}
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                        <Badge bg="info" className="text-dark px-2.5 py-1">
                          {session.skill}
                        </Badge>
                        <h5 className="fw-bold text-light mb-0">{session.title}</h5>
                        {session.status === "Requested" && (
                          <Badge bg="warning" className="text-dark">
                            <FaClock className="me-1" /> Pending Response
                          </Badge>
                        )}
                        {session.status === "Accepted" && (
                          <Badge bg="success">Confirmed Upcoming</Badge>
                        )}
                        {session.status === "Completed" && (
                          <Badge bg="secondary">✓ Completed</Badge>
                        )}
                      </div>

                      {/* Role and Partner */}
                      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                        {isTeacher ? (
                          <span className="d-flex align-items-center gap-1 text-info">
                            <FaChalkboardTeacher /> You are Teaching
                          </span>
                        ) : (
                          <span className="d-flex align-items-center gap-1 text-warning">
                            <FaUserGraduate /> You are Learning
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          Partner:{" "}
                          <Link
                            to={`/profile/${otherUser?.username}`}
                            className="text-light fw-semibold text-decoration-none hover-underline"
                          >
                            {otherUser?.name || "Peer"}
                          </Link>{" "}
                          (@{otherUser?.username})
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="text-secondary small d-flex flex-wrap align-items-center gap-3">
                        <span>📅 Date: <strong>{session.date}</strong></span>
                        <span>⏰ Time: <strong>{session.time}</strong></span>
                        <span>⏱️ Duration: <strong>{session.duration} mins</strong></span>
                      </div>

                      {session.description && (
                        <p className="text-muted small mt-2 mb-0 fst-italic">
                          "{session.description}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-wrap gap-2 align-self-end align-self-md-center">
                      {session.status === "Requested" && (
                        <>
                          {!isCreator ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                className="d-flex align-items-center gap-1 px-3"
                                onClick={() => handleAccept(session._id)}
                              >
                                <FaCheck /> Accept
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                className="d-flex align-items-center gap-1 px-3"
                                onClick={() => handleReject(session._id)}
                              >
                                <FaTimes /> Decline
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleCancel(session._id)}
                            >
                              Cancel Request
                            </Button>
                          )}
                        </>
                      )}

                      {session.status === "Accepted" && (
                        <>
                          {session.meetingLink && (
                            <Button
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="info"
                              size="sm"
                              className="d-flex align-items-center gap-1 text-dark fw-semibold px-3"
                            >
                              <FaVideo /> Join Call
                            </Button>
                          )}
                          <Button
                            variant="success"
                            size="sm"
                            className="d-flex align-items-center gap-1 px-3"
                            onClick={() => handleComplete(session)}
                          >
                            <FaCheck /> Mark Completed
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleCancel(session._id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {session.status === "Completed" && (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="d-flex align-items-center gap-1 px-3"
                          onClick={() => {
                            setSelectedSessionForRating(session);
                            setSelectedPartnerForRating(otherUser);
                            setShowRatingModal(true);
                          }}
                        >
                          <FaStar /> Rate & Review Peer
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      {/* Schedule Modal */}
      <ScheduleSessionModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        partner={selectedPartnerForSchedule}
        onSessionScheduled={fetchSessions}
      />

      {/* Rating Modal */}
      {selectedSessionForRating && selectedPartnerForRating && (
        <RatingModal
          show={showRatingModal}
          onHide={() => setShowRatingModal(false)}
          session={selectedSessionForRating}
          targetUser={selectedPartnerForRating}
          onRatingSubmitted={fetchSessions}
        />
      )}
    </div>
  );
};

export default Sessions;
