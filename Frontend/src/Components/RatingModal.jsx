import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const RatingModal = ({ show, onHide, targetUser, session, onRatingSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [skill, setSkill] = useState(session?.skill || "General Peer Learning");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide written feedback for your peer.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: targetUser?.username,
        rating,
        skill: skill || "General Peer Learning",
        description: description.trim(),
        sessionId: session?._id || null,
      };

      const { data } = await axios.post("/rating/rate", payload);
      toast.success("Thank you! Your review has been published.");
      if (onRatingSubmitted) onRatingSubmitted(data.data);
      onHide();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="skillswap-modal">
      <Modal.Header closeButton style={{ backgroundColor: "#1e293b", color: "#fff", borderBottom: "1px solid #334155" }}>
        <Modal.Title className="fs-5">
          Rate & Review • {targetUser?.name || "Peer"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ backgroundColor: "#0f172a", color: "#e2e8f0", padding: "1.5rem" }}>
          {session && (
            <div className="p-2 mb-3 rounded text-info small" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
              Session: <strong>{session.title}</strong> ({session.skill})
            </div>
          )}

          {/* Star Selector */}
          <div className="text-center my-3">
            <div className="d-flex justify-content-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={32}
                  className="cursor-pointer transition-all"
                  style={{
                    color: star <= (hoverRating || rating) ? "#fbbf24" : "#475569",
                    cursor: "pointer",
                    transition: "transform 0.1s ease",
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <span className="text-warning fw-bold fs-6">
              {rating === 5 && "5.0 - Exceptional Peer Learning"}
              {rating === 4 && "4.0 - Great & Insightful Session"}
              {rating === 3 && "3.0 - Good Experience"}
              {rating === 2 && "2.0 - Fair"}
              {rating === 1 && "1.0 - Needs Improvement"}
            </span>
          </div>

          {/* Skill Reviewed */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Skill Evaluated</Form.Label>
            <Form.Control
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="e.g. React, Node.js, Python"
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
              required
            />
          </Form.Group>

          {/* Written Feedback */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted small text-uppercase fw-bold">Written Feedback</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share how this peer helped you, their communication, teaching style, and practical knowledge..."
              style={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }}
              required
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
            {loading ? <Spinner animation="border" size="sm" /> : "Submit Review"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RatingModal;
