import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Dropdown,
  Badge,
  Offcanvas,
  Spinner,
} from "react-bootstrap";
import {
  FaExchangeAlt,
  FaCompass,
  FaUserFriends,
  FaCalendarAlt,
  FaComments,
  FaCheckCircle,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaHome,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import { useSocket } from "../../util/SocketContext";
import axios from "axios";

const Header = () => {
  const { user, logout } = useUser();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications and pending requests count periodically
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const [notifRes, reqRes] = await Promise.all([
          axios.get("/notifications"),
          axios.get("/request/getRequests"),
        ]);

        if (notifRes?.data?.data) {
          setUnreadNotifications(notifRes.data.data.unreadCount || 0);
          setNotificationsList(notifRes.data.data.notifications?.slice(0, 5) || []);
        }

        if (reqRes?.data?.data) {
          setPendingRequestsCount(reqRes.data.data.length || 0);
        }
      } catch (err) {
        // Silent catch for background poll
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar
      expand="lg"
      sticky="top"
      style={{
        backgroundColor: "#0f172a",
        borderBottom: "1px solid #1e293b",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        padding: "0.75rem 1rem",
        zIndex: 1050,
      }}
    >
      <Container fluid className="px-lg-4">
        {/* Brand */}
        <Navbar.Brand
          as={Link}
          to={user ? "/dashboard" : "/"}
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-2"
            style={{
              background: "linear-gradient(135deg, #3bb4a1 0%, #0d9488 100%)",
              boxShadow: "0 0 15px rgba(59, 180, 161, 0.4)",
            }}
          >
            <FaExchangeAlt color="#000" size={18} />
          </div>
          <span
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "1.45rem",
              fontWeight: "700",
              letterSpacing: "1px",
              background: "linear-gradient(to right, #3bb4a1, #fbf1a4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Time2Skill
          </span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="skillswap-nav"
          style={{ borderColor: "#334155" }}
        />

        <Navbar.Collapse id="skillswap-nav">
          <Nav className="ms-auto align-items-lg-center gap-1 gap-lg-2">
            {user ? (
              <>
                {/* Dashboard */}
                <Nav.Link
                  as={Link}
                  to="/dashboard"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
                    isActive("/dashboard") ? "text-white fw-bold bg-slate-800" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/dashboard") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaHome size={15} className="text-info" />
                  <span>Dashboard</span>
                </Nav.Link>

                {/* Discover */}
                <Nav.Link
                  as={Link}
                  to="/discover"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
                    isActive("/discover") ? "text-white fw-bold" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/discover") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaCompass size={15} className="text-warning" />
                  <span>Discover</span>
                </Nav.Link>

                {/* Connections */}
                <Nav.Link
                  as={Link}
                  to="/connections"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 position-relative ${
                    isActive("/connections") ? "text-white fw-bold" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/connections") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaUserFriends size={15} className="text-success" />
                  <span>Connections</span>
                  {pendingRequestsCount > 0 && (
                    <Badge bg="danger" pill style={{ fontSize: "0.68rem" }}>
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </Nav.Link>

                {/* Sessions */}
                <Nav.Link
                  as={Link}
                  to="/sessions"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
                    isActive("/sessions") ? "text-white fw-bold" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/sessions") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaCalendarAlt size={15} className="text-info" />
                  <span>Sessions</span>
                </Nav.Link>

                {/* Chats */}
                <Nav.Link
                  as={Link}
                  to="/chats"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
                    isActive("/chats") ? "text-white fw-bold" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/chats") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaComments size={15} className="text-primary" />
                  <span>Chats</span>
                </Nav.Link>

                {/* Verify Skills */}
                <Nav.Link
                  as={Link}
                  to="/verify"
                  className={`px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${
                    isActive("/verify") ? "text-white fw-bold" : "text-light"
                  }`}
                  style={{
                    backgroundColor: isActive("/verify") ? "#1e293b" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <FaCheckCircle size={15} className="text-teal" style={{ color: "#3bb4a1" }} />
                  <span style={{ color: "#3bb4a1", fontWeight: "600" }}>Verify Skills</span>
                </Nav.Link>

                {/* Notifications Dropdown */}
                <Dropdown align="end" className="mx-1">
                  <Dropdown.Toggle
                    as="div"
                    className="p-2 rounded-circle cursor-pointer text-light position-relative"
                    style={{ cursor: "pointer", backgroundColor: "#1e293b" }}
                  >
                    <FaBell size={16} />
                    {unreadNotifications > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {unreadNotifications}
                      </span>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      minWidth: "300px",
                      maxWidth: "360px",
                      padding: "0.5rem",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center px-2 py-1 mb-2 border-bottom border-secondary">
                      <span className="fw-bold text-light small">Notifications</span>
                      <Link
                        to="/notifications"
                        className="text-info text-decoration-none small"
                        style={{ fontSize: "0.75rem" }}
                      >
                        View All
                      </Link>
                    </div>

                    {notificationsList.length === 0 ? (
                      <div className="text-center py-3 text-muted small">
                        No new notifications
                      </div>
                    ) : (
                      notificationsList.map((n) => (
                        <Dropdown.Item
                          key={n._id}
                          as={Link}
                          to={n.link || "/notifications"}
                          className="px-2 py-2 rounded text-light text-wrap small border-bottom border-dark"
                          style={{ backgroundColor: n.isRead ? "transparent" : "#0f172a" }}
                        >
                          <div className="fw-semibold text-info mb-0.5" style={{ fontSize: "0.8rem" }}>
                            {n.title}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.74rem" }}>
                            {n.message}
                          </div>
                        </Dropdown.Item>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                {/* User Avatar Dropdown */}
                <Dropdown align="end" className="ms-1">
                  <Dropdown.Toggle
                    as="div"
                    className="d-flex align-items-center gap-2 p-1 rounded-pill cursor-pointer"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      paddingRight: "0.75rem !important",
                    }}
                  >
                    <div className="position-relative">
                      <img
                        src={
                          user.picture ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                        }
                        alt={user.name}
                        className="rounded-circle"
                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                      />
                      <span
                        className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                        style={{
                          width: "9px",
                          height: "9px",
                          backgroundColor: "#10b981",
                        }}
                      />
                    </div>
                    <span className="text-light small fw-semibold d-none d-md-inline pe-2">
                      {user.name?.split(" ")[0]}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      minWidth: "210px",
                      padding: "0.5rem",
                    }}
                  >
                    <div className="px-3 py-2 border-bottom border-secondary mb-1">
                      <div className="fw-bold text-light">{user.name}</div>
                      <div className="text-muted small">@{user.username}</div>
                    </div>

                    <Dropdown.Item
                      as={Link}
                      to={`/profile/${user.username}`}
                      className="d-flex align-items-center gap-2 py-2 text-light rounded"
                    >
                      <FaUser className="text-info" />
                      <span>View Profile</span>
                    </Dropdown.Item>

                    <Dropdown.Item
                      as={Link}
                      to="/edit_profile"
                      className="d-flex align-items-center gap-2 py-2 text-light rounded"
                    >
                      <FaEdit className="text-warning" />
                      <span>Edit Profile</span>
                    </Dropdown.Item>

                    <Dropdown.Item
                      as={Link}
                      to="/verify"
                      className="d-flex align-items-center gap-2 py-2 text-light rounded"
                    >
                      <FaCheckCircle className="text-success" />
                      <span>Verify Skills</span>
                    </Dropdown.Item>

                    <Dropdown.Divider style={{ borderColor: "#334155" }} />

                    <Dropdown.Item
                      onClick={logout}
                      className="d-flex align-items-center gap-2 py-2 text-danger rounded"
                    >
                      <FaSignOutAlt />
                      <span>Log Out</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/"
                  className="px-3 py-2 text-light"
                >
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/about_us"
                  className="px-3 py-2 text-light"
                >
                  About SkillSwap
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="btn btn-outline-info px-3 py-1.5 ms-lg-2 rounded-3 text-info fw-semibold"
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="btn btn-info px-3 py-1.5 ms-lg-2 rounded-3 text-dark fw-semibold"
                  style={{ backgroundColor: "#3bb4a1", borderColor: "#3bb4a1" }}
                >
                  Sign Up Free
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
