import React, { useState, useEffect } from "react";
import { Container, Card, Button, Badge, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaCheckCircle,
  FaComments,
  FaUserFriends,
  FaCalendarAlt,
  FaStar,
  FaGithub,
  FaTrash,
  FaCheckDouble,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/notifications");
      if (data?.data) {
        setNotifications(data.data.notifications || []);
      }
    } catch (err) {
      console.log("Error loading notifications:", err);
      toast.error("Could not fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) =>
          notificationId === "all" || n._id === notificationId
            ? { ...n, isRead: true }
            : n
        )
      );
      toast.success(
        notificationId === "all"
          ? "All marked as read."
          : "Notification marked as read."
      );
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete("/notifications/clear");
      setNotifications([]);
      toast.info("All notifications cleared.");
    } catch (err) {
      toast.error("Failed to clear notifications.");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "CONNECTION_REQUEST":
      case "CONNECTION_ACCEPTED":
        return <FaUserFriends className="text-success" size={20} />;
      case "NEW_MESSAGE":
        return <FaComments className="text-primary" size={20} />;
      case "SESSION_REQUEST":
      case "SESSION_ACCEPTED":
      case "SESSION_COMPLETED":
        return <FaCalendarAlt className="text-warning" size={20} />;
      case "NEW_REVIEW":
        return <FaStar className="text-warning" size={20} />;
      case "SKILL_VERIFIED":
        return <FaCheckCircle className="text-info" size={20} />;
      case "PORTFOLIO_ANALYZED":
        return <FaGithub className="text-warning" size={20} />;
      default:
        return <FaBell className="text-info" size={20} />;
    }
  };

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "92vh", paddingBottom: "4rem" }}>
      <Container className="py-4" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              <FaBell className="text-info" /> Notifications Center
            </h2>
            <p className="text-muted small mb-0">
              Stay updated on connection requests, learning session updates, and messages.
            </p>
          </div>

          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => handleMarkAsRead("all")}
              className="text-light d-flex align-items-center gap-1"
            >
              <FaCheckDouble /> Mark all as read
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearAll}
              className="d-flex align-items-center gap-1"
            >
              <FaTrash /> Clear all
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-5 text-center rounded-4 border-0" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
            <FaBell size={40} className="text-muted mb-3" />
            <h5 className="fw-bold text-light">No notifications yet</h5>
            <p className="text-muted small mb-0">
              When peers interact with you, send connection requests, or arrange learning sessions, alerts will appear here.
            </p>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-2.5">
            {notifications.map((n) => (
              <Card
                key={n._id}
                className="p-3.5 border border-secondary border-opacity-25 rounded-3 transition-all"
                style={{
                  backgroundColor: n.isRead ? "#1e293b" : "#0f172a",
                  borderLeft: n.isRead ? "3px solid #475569" : "3px solid #3bb4a1",
                }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-dark mt-1">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="fw-bold text-light mb-0 small">{n.title}</h6>
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <p className="text-secondary small mb-2">{n.message}</p>

                    <div className="d-flex align-items-center gap-2">
                      {n.link && (
                        <Button
                          as={Link}
                          to={n.link}
                          size="sm"
                          variant="outline-info"
                          className="py-0 px-2"
                          style={{ fontSize: "0.74rem" }}
                          onClick={() => handleMarkAsRead(n._id)}
                        >
                          View Details ↗
                        </Button>
                      )}
                      {!n.isRead && (
                        <Button
                          size="sm"
                          variant="link"
                          className="text-muted py-0 px-1 text-decoration-none small"
                          onClick={() => handleMarkAsRead(n._id)}
                          style={{ fontSize: "0.74rem" }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default Notifications;
