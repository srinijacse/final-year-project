import React, { useState } from "react";
import { Card, Button, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaComments,
  FaUserPlus,
  FaCheck,
  FaClock,
} from "react-icons/fa";
import SkillBadge from "../../Components/SkillBadge";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import axios from "axios";
import { toast } from "react-toastify";
import { useSocket } from "../../util/SocketContext";

const ProfileCard = ({ peer, onStatusChange }) => {
  const navigate = useNavigate();
  const { isUserOnline } = useSocket();
  const [connectLoading, setConnectLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [status, setStatus] = useState(peer.connectionStatus || "Connect");

  const isOnline = isUserOnline(peer._id);

  const handleConnect = async () => {
    try {
      setConnectLoading(true);
      const { data } = await axios.post("/request/create", {
        receiverID: peer._id,
      });
      setStatus("Pending");
      toast.success(data.message || "Connection request sent!");
      if (onStatusChange) onStatusChange(peer._id, "Pending");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send request.");
    } finally {
      setConnectLoading(false);
    }
  };

  const teachingSkills = peer.skillsProficientAt || [];
  const learningSkills = peer.skillsToLearn || [];

  return (
    <>
      <Card
        className="h-100 border-0 rounded-4 shadow-sm overflow-hidden d-flex flex-column transition-all"
        style={{
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Card Header & Match Badge */}
        <div className="p-3 pb-0 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-1.5">
            {peer.isMutualMatch && (
              <Badge
                bg="success"
                className="px-2 py-1 d-flex align-items-center gap-1 rounded-pill"
                style={{ fontSize: "0.72rem" }}
              >
                <FaExchangeAlt size={10} /> Mutual Swap
              </Badge>
            )}
            <Badge
              bg="dark"
              className="border border-secondary text-info px-2 py-1 rounded-pill"
              style={{ fontSize: "0.72rem" }}
            >
              {peer.matchScore || 50}% Match
            </Badge>
          </div>

          <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
            <FaStar size={13} />
            <span>{(peer.rating || 5).toFixed(1)}</span>
            <span className="text-muted fw-normal">({peer.completedSessions || 0} sessions)</span>
          </div>
        </div>

        {/* Profile Info */}
        <Card.Body className="p-3 d-flex flex-column">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="position-relative">
              <img
                src={
                  peer.picture ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                }
                alt={peer.name}
                className="rounded-circle"
                style={{ width: "56px", height: "56px", objectFit: "cover" }}
              />
              <span
                className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: isOnline ? "#10b981" : "#64748b",
                }}
                title={isOnline ? "Online Now" : "Offline"}
              />
            </div>

            <div className="flex-grow-1 overflow-hidden">
              <Link
                to={`/profile/${peer.username}`}
                className="fw-bold text-light fs-6 text-decoration-none d-block text-truncate hover-underline"
              >
                {peer.name}
              </Link>
              <span className="text-muted small d-block mb-1">@{peer.username}</span>
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.75rem" }}>
                {peer.location && (
                  <span className="d-flex align-items-center gap-1 text-truncate">
                    <FaMapMarkerAlt size={10} /> {peer.location}
                  </span>
                )}
                {peer.experienceLevel && (
                  <Badge bg="secondary" className="px-1.5 py-0.5 rounded" style={{ fontSize: "0.68rem" }}>
                    {peer.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <p
            className="text-secondary small mb-3 text-truncate-2"
            style={{
              fontSize: "0.82rem",
              lineHeight: "1.4",
              minHeight: "2.3rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {peer.bio || "Passionate peer learner and mentor ready to exchange skills on SkillSwap."}
          </p>

          {/* Match Reasons Highlight */}
          {peer.matchReasons && peer.matchReasons.length > 0 && (
            <div
              className="p-2 rounded-2 mb-3 small"
              style={{
                backgroundColor: "rgba(59, 180, 161, 0.08)",
                border: "1px dashed rgba(59, 180, 161, 0.3)",
                fontSize: "0.75rem",
                color: "#3bb4a1",
              }}
            >
              💡 {peer.matchReasons[0]}
            </div>
          )}

          {/* Skills They Can Teach */}
          <div className="mb-2">
            <span className="text-muted small text-uppercase fw-bold d-block mb-1" style={{ fontSize: "0.68rem" }}>
              Can Teach:
            </span>
            <div className="d-flex flex-wrap gap-1">
              {teachingSkills.slice(0, 4).map((sk, idx) => (
                <SkillBadge key={idx} skill={sk} size="sm" />
              ))}
              {teachingSkills.length > 4 && (
                <span className="badge bg-dark border border-secondary text-muted align-self-center">
                  +{teachingSkills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Skills They Want To Learn */}
          <div className="mb-3 mt-1">
            <span className="text-muted small text-uppercase fw-bold d-block mb-1" style={{ fontSize: "0.68rem" }}>
              Wants to Learn:
            </span>
            <div className="d-flex flex-wrap gap-1">
              {learningSkills.slice(0, 3).map((sk, idx) => (
                <span
                  key={idx}
                  className="badge bg-black bg-opacity-40 text-warning border border-secondary border-opacity-50 px-2 py-1 rounded-pill"
                  style={{ fontSize: "0.72rem" }}
                >
                  {typeof sk === "string" ? sk : sk.name}
                </span>
              ))}
              {learningSkills.length > 3 && (
                <span className="badge bg-dark border border-secondary text-muted align-self-center">
                  +{learningSkills.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Actions Row */}
          <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex gap-2">
            <Button
              as={Link}
              to={`/profile/${peer.username}`}
              variant="outline-secondary"
              size="sm"
              className="flex-grow-1 text-light py-1.5"
              style={{ fontSize: "0.82rem" }}
            >
              Profile
            </Button>

            {status === "Connected" ? (
              <>
                <Button
                  as={Link}
                  to="/chats"
                  size="sm"
                  variant="info"
                  className="text-dark fw-semibold py-1.5 d-flex align-items-center justify-content-center gap-1"
                  style={{ fontSize: "0.82rem", backgroundColor: "#3bb4a1", borderColor: "#3bb4a1" }}
                >
                  <FaComments /> Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline-warning"
                  className="py-1.5"
                  style={{ fontSize: "0.82rem" }}
                  onClick={() => setShowScheduleModal(true)}
                  title="Schedule Session"
                >
                  <FaCalendarAlt />
                </Button>
              </>
            ) : status === "Pending" ? (
              <Button
                size="sm"
                variant="secondary"
                disabled
                className="flex-grow-1 py-1.5 d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.82rem" }}
              >
                <FaClock /> Pending
              </Button>
            ) : status === "Incoming Request" ? (
              <Button
                as={Link}
                to="/connections"
                size="sm"
                variant="success"
                className="flex-grow-1 py-1.5 d-flex align-items-center justify-content-center gap-1"
                style={{ fontSize: "0.82rem" }}
              >
                <FaCheck /> Respond
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-grow-1 py-1.5 border-0 text-dark fw-semibold d-flex align-items-center justify-content-center gap-1"
                style={{ backgroundColor: "#3bb4a1", fontSize: "0.82rem" }}
                onClick={handleConnect}
                disabled={connectLoading}
              >
                <FaUserPlus /> {connectLoading ? "Sending..." : "Connect"}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        partner={peer}
      />
    </>
  );
};

export default ProfileCard;
