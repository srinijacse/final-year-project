import  { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Nav, Badge, Spinner, InputGroup, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaComments,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaSearch,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import SkillBadge from "../../Components/SkillBadge";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import axios from "axios";
import { toast } from "react-toastify";
import { useSocket } from "../../util/SocketContext";

const Connections = () => {
  const navigate = useNavigate();
  const { isUserOnline } = useSocket();

  const [activeTab, setActiveTab] = useState("connections");
  const [loading, setLoading] = useState(true);

  const [connections, setConnections] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const fetchConnectionsData = async () => {
    try {
      setLoading(true);
      const [connRes, inRes, outRes] = await Promise.all([
        axios.get("/request/connections"),
        axios.get("/request/getRequests"),
        axios.get("/request/outgoing"),
      ]);

      if (connRes?.data?.data) setConnections(connRes.data.data);
      if (inRes?.data?.data) setIncomingRequests(inRes.data.data);
      if (outRes?.data?.data) setOutgoingRequests(outRes.data.data);
    } catch (err) {
      console.log("Error loading connections:", err);
      toast.error("Could not fetch connection requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectionsData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await axios.post("/request/acceptRequest", { requestId });
      toast.success("Connection request accepted! You can now chat.");
      fetchConnectionsData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post("/request/rejectRequest", { requestId });
      toast.info("Connection request rejected.");
      fetchConnectionsData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject request.");
    }
  };

  const handleCancelOutgoing = async (requestId) => {
    try {
      await axios.delete(`/request/cancel/${requestId}`);
      toast.info("Outgoing request cancelled.");
      fetchConnectionsData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel request.");
    }
  };

  const filteredConnections = connections.filter((c) => {
    const sTerm = search.toLowerCase().trim();
    if (!sTerm) return true;
    return (
      (c.name || "").toLowerCase().includes(sTerm) ||
      (c.username || "").toLowerCase().includes(sTerm) ||
      (c.skillsProficientAt || []).some((s) => (s.name || s).toLowerCase().includes(sTerm))
    );
  });

  return (
    <div style={{ backgroundColor: "#0b1120", color: "#f8fafc", minHeight: "92vh", paddingBottom: "4rem" }}>
      <Container className="py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-light mb-1 d-flex align-items-center gap-2" style={{ fontFamily: "'Josefin Sans', sans-serif" }}>
              <FaUserFriends className="text-success" /> Your Network & Connection Requests
            </h2>
            <p className="text-muted small mb-0">
              Manage your connected peers, respond to requests, and start 1-on-1 conversations.
            </p>
          </div>
          <Button as={Link} to="/discover" className="border-0 text-dark fw-semibold" style={{ backgroundColor: "#3bb4a1" }}>
            + Find New Peers
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom border-secondary border-opacity-25 pb-3">
          <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="gap-2">
            <Nav.Item>
              <Nav.Link
                eventKey="connections"
                className={`rounded-pill px-4 py-2 small fw-semibold ${
                  activeTab === "connections" ? "bg-primary text-white" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                Connected Peers ({connections.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="incoming"
                className={`rounded-pill px-4 py-2 small fw-semibold d-flex align-items-center gap-2 ${
                  activeTab === "incoming" ? "bg-success text-white" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                <span>Incoming Requests</span>
                {incomingRequests.length > 0 && (
                  <Badge bg="danger" pill style={{ fontSize: "0.68rem" }}>
                    {incomingRequests.length}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="outgoing"
                className={`rounded-pill px-4 py-2 small fw-semibold ${
                  activeTab === "outgoing" ? "bg-warning text-dark" : "text-light bg-dark bg-opacity-50"
                }`}
              >
                Outgoing Requests ({outgoingRequests.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {activeTab === "connections" && (
            <div style={{ maxWidth: "280px" }} className="w-100">
              <InputGroup size="sm">
                <InputGroup.Text style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#94a3b8" }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter connections..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                />
              </InputGroup>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : activeTab === "connections" ? (
          filteredConnections.length === 0 ? (
            <div className="p-5 text-center rounded-4 border border-secondary border-opacity-25 my-4" style={{ backgroundColor: "#1e293b" }}>
              <FaUserFriends size={40} className="text-muted mb-3" />
              <h5 className="fw-bold text-light">No connected peers yet</h5>
              <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "450px" }}>
                Send connection requests from the Discover feed to start chatting and scheduling learning sessions with other members.
              </p>
              <Button as={Link} to="/discover" variant="outline-info" size="sm" className="rounded-pill px-4 py-2">
                Browse Discover Feed
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {filteredConnections.map((peer) => {
                const isOnline = isUserOnline(peer._id);
                return (
                  <Col key={peer._id} md={6} lg={4}>
                    <Card className="h-100 p-3 rounded-4 border border-secondary border-opacity-25 d-flex flex-column" style={{ backgroundColor: "#1e293b" }}>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="position-relative">
                          <img
                            src={peer.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt={peer.name}
                            className="rounded-circle"
                            style={{ width: "52px", height: "52px", objectFit: "cover" }}
                          />
                          <span
                            className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                            style={{ width: "12px", height: "12px", backgroundColor: isOnline ? "#10b981" : "#64748b" }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <Link to={`/profile/${peer.username}`} className="fw-bold text-light text-decoration-none d-block text-truncate hover-underline">
                            {peer.name}
                          </Link>
                          <span className="text-muted small d-block">@{peer.username}</span>
                          <div className="d-flex align-items-center gap-1 text-warning small">
                            <FaStar size={11} /> <span>{(peer.rating || 5).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-muted small d-block" style={{ fontSize: "0.72rem" }}>Teaches:</span>
                        <div className="d-flex flex-wrap gap-1">
                          {(peer.skillsProficientAt || []).slice(0, 3).map((sk, i) => (
                            <SkillBadge key={i} skill={sk} size="sm" />
                          ))}
                        </div>
                      </div>

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
                        <Button
                          as={Link}
                          to="/chats"
                          size="sm"
                          className="border-0 text-dark fw-semibold d-flex align-items-center justify-content-center gap-1 flex-grow-1 py-1.5"
                          style={{ backgroundColor: "#3bb4a1", fontSize: "0.82rem" }}
                        >
                          <FaComments /> Chat
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="py-1.5"
                          onClick={() => {
                            setSelectedPartner(peer);
                            setShowScheduleModal(true);
                          }}
                          title="Schedule Session"
                        >
                          <FaCalendarAlt />
                        </Button>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )
        ) : activeTab === "incoming" ? (
          incomingRequests.length === 0 ? (
            <div className="p-5 text-center rounded-4 border border-secondary border-opacity-25 my-4" style={{ backgroundColor: "#1e293b" }}>
              <h5 className="fw-bold text-light">No incoming requests</h5>
              <p className="text-muted small mb-0">When other members request to connect with you, they will show up here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {incomingRequests.map((reqItem) => {
                const sender = reqItem.sender || reqItem;
                return (
                  <Card key={reqItem._id} className="p-3.5 rounded-4 border border-secondary border-opacity-25" style={{ backgroundColor: "#1e293b" }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={sender.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={sender.name}
                          className="rounded-circle"
                          style={{ width: "52px", height: "52px", objectFit: "cover" }}
                        />
                        <div>
                          <Link to={`/profile/${sender.username}`} className="fw-bold text-light text-decoration-none fs-6 hover-underline">
                            {sender.name}
                          </Link>
                          <span className="text-muted small d-block">@{sender.username}</span>
                          <p className="text-secondary small mb-0 mt-1">{sender.bio || "Wants to connect on SkillSwap"}</p>
                        </div>
                      </div>

                      <div className="d-flex gap-2 align-self-end align-self-md-center">
                        <Button as={Link} to={`/profile/${sender.username}`} variant="outline-secondary" size="sm" className="text-light px-3">
                          Profile
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="d-flex align-items-center gap-1 px-3"
                          onClick={() => handleAccept(sender._id || reqItem._id)}
                        >
                          <FaCheck /> Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="d-flex align-items-center gap-1 px-3"
                          onClick={() => handleReject(sender._id || reqItem._id)}
                        >
                          <FaTimes /> Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          outgoingRequests.length === 0 ? (
            <div className="p-5 text-center rounded-4 border border-secondary border-opacity-25 my-4" style={{ backgroundColor: "#1e293b" }}>
              <h5 className="fw-bold text-light">No pending outgoing requests</h5>
              <p className="text-muted small mb-0">Connection requests you have sent that are waiting for response will appear here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {outgoingRequests.map((reqItem) => {
                const receiver = reqItem.receiver || reqItem;
                return (
                  <Card key={reqItem._id} className="p-3.5 rounded-4 border border-secondary border-opacity-25" style={{ backgroundColor: "#1e293b" }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={receiver.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={receiver.name}
                          className="rounded-circle"
                          style={{ width: "52px", height: "52px", objectFit: "cover" }}
                        />
                        <div>
                          <Link to={`/profile/${receiver.username}`} className="fw-bold text-light text-decoration-none fs-6 hover-underline">
                            {receiver.name}
                          </Link>
                          <span className="text-muted small d-block">@{receiver.username}</span>
                          <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary small mt-1">
                            <FaClock className="me-1" /> Pending Response
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="align-self-end align-self-md-center"
                        onClick={() => handleCancelOutgoing(reqItem._id)}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        )}
      </Container>

      {/* Session Schedule Modal */}
      {selectedPartner && (
        <ScheduleSessionModal
          show={showScheduleModal}
          onHide={() => setShowScheduleModal(false)}
          partner={selectedPartner}
          onSessionScheduled={fetchConnectionsData}
        />
      )}
    </div>
  );
};

export default Connections;
