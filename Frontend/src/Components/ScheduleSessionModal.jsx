import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../util/UserContext";

const ScheduleSessionModal = ({ show, onHide, partner, onSessionScheduled }) => {
  const { user } = useUser();
  const [role, setRole] = useState("partner_teaches"); // "partner_teaches" or "i_teach"
  const [skill, setSkill] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Available skills based on role
  const partnerTeachingSkills = (partner?.skillsProficientAt || []).map((s) => s.name || s);
  const myTeachingSkills = (user?.skillsProficientAt || []).map((s) => s.name || s);

  const currentAvailableSkills =
    role === "partner_teaches" ? partnerTeachingSkills : myTeachingSkills;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!partner?._id) {
      toast.error("Partner not selected.");
      return;
    }

    if (!skill) {
      toast.error("Please select or enter the skill for this session.");
      return;
    }

    if (!date || !time) {
      toast.error("Please select a date and time.");
      return;
    }

    setLoading(true);
    try {
      const teacherId = role === "partner_teaches" ? partner._id : user._id;
      const learnerId = role === "partner_teaches" ? user._id : partner._id;

      const payload = {
        teacherId,
        learnerId,
        skill,
        title: title || `${skill} Peer Learning Session`,
        description,
        date,
        time,
        duration: Number(duration),
        meetingLink: meetingLink.trim() || `https://meet.google.com/new`,
      };

      const { data } = await axios.post("/sessions/create", payload);
      toast.success("Learning session requested successfully!");
      if (onSessionScheduled) onSessionScheduled(data.data);
      onHide();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to schedule session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="skillswap-modal" size="lg">
      <Modal.Header closeButton style={{ backgroundColor: "#1e293b", color: "#fff", borderBottom: "1px solid #334155" }}>
        <Modal.Title className="fs-5">
          Schedule Learning Session with {partner?.name || "Peer"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "1.5rem" }}>
          {/* Who is teaching? */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Session Mode</Form.Label>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="role-partner"
                name="sessionRole"
                label={`${partner?.name || "Peer"} teaches me`}
                checked={role === "partner_teaches"}
                onChange={() => {
                  setRole("partner_teaches");
                  setSkill(partnerTeachingSkills[0] || "");
                }}
                className="text-light"
              />
              <Form.Check
                type="radio"
                id="role-me"
                name="sessionRole"
                label={`I teach ${partner?.name || "Peer"}`}
                checked={role === "i_teach"}
                onChange={() => {
                  setRole("i_teach");
                  setSkill(myTeachingSkills[0] || "");
                }}
                className="text-light"
              />
            </div>
          </Form.Group>

          {/* Skill Selection */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Skill</Form.Label>
            {currentAvailableSkills.length > 0 ? (
              <Form.Select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                required
              >
                <option value="">Select a skill</option>
                {currentAvailableSkills.map((sName, idx) => (
                  <option key={idx} value={sName}>
                    {sName}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type="text"
                placeholder="e.g. React, Python, AWS"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                required
              />
            )}
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Session Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Deep dive into React Hooks & Custom Redux Store"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
              required
            />
          </Form.Group>

          {/* Date, Time, Duration */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted small text-uppercase fw-bold">Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted small text-uppercase fw-bold">Time</Form.Label>
                <Form.Control
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted small text-uppercase fw-bold">Duration (Minutes)</Form.Label>
                <Form.Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={90}>90 Minutes (1.5 Hours)</option>
                  <option value={120}>120 Minutes (2 Hours)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Goals & Discussion Topics</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="What concepts would you like to cover during this peer exchange session?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
            />
          </Form.Group>

          {/* Meeting Link */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Meeting Link (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. https://meet.google.com/xxx-yyyy-zzz or Zoom link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#1e293b", borderTop: "1px solid #334155" }}>
          <Button variant="outline-light" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            style={{ backgroundColor: "#3bb4a1", borderColor: "#3bb4a1", color: "#000", fontWeight: "600" }}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Request Session"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ScheduleSessionModal;
