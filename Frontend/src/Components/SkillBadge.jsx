import React, { useState } from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaCheckCircle, FaGithub, FaAward, FaPlus, FaCheck } from "react-icons/fa";
import PortfolioModal from "./PortfolioModal";

const SkillBadge = ({ skill, isOwner, onVerify, onAddPortfolio, size = "md" }) => {
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const skillName = typeof skill === "string" ? skill : skill.name;
  const status = typeof skill === "object" ? skill.status || "Claimed" : "Claimed";
  const assessmentScore = typeof skill === "object" ? skill.assessmentScore : null;
  const githubEvidence = typeof skill === "object" ? skill.githubEvidence : null;

  const isPortfolioVerified = status === "Verified + Portfolio";
  const isSkillVerified = status === "Verified" || isPortfolioVerified;

  const getBadgeStyle = () => {
    if (isPortfolioVerified) {
      return {
        background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
        color: "#ffffff",
        border: "1px solid #34d399",
        boxShadow: "0 2px 8px rgba(13, 148, 136, 0.3)",
      };
    }
    if (isSkillVerified) {
      return {
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        color: "#ffffff",
        border: "1px solid #38bdf8",
        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
      };
    }
    return {
      background: "#334155",
      color: "#cbd5e1",
      border: "1px solid #475569",
    };
  };

  const getBadgeIcon = () => {
    if (isPortfolioVerified) {
      return (
        <span className="d-inline-flex align-items-center gap-1">
          <FaCheckCircle className="text-warning" />
          <FaGithub className="text-light" />
        </span>
      );
    }
    if (isSkillVerified) {
      return <FaCheckCircle className="text-info" />;
    }
    return null;
  };

  return (
    <>
      <span className="d-inline-flex align-items-center gap-1 m-1">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-${skillName}`}>
              {isPortfolioVerified
                ? `${skillName} • Verified (${assessmentScore || 90}%) + GitHub Portfolio (${githubEvidence?.score || 85}/100) — Click to view code evidence`
                : isSkillVerified
                ? `${skillName} • Verified through SkillSwap Assessment (${assessmentScore || 85}%)`
                : `${skillName} • Claimed Skill`}
            </Tooltip>
          }
        >
          <span
            className={`d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill user-select-none ${
              isPortfolioVerified ? "cursor-pointer" : ""
            }`}
            style={{
              ...getBadgeStyle(),
              fontSize: size === "sm" ? "0.78rem" : size === "lg" ? "0.95rem" : "0.85rem",
              fontWeight: 500,
              cursor: isPortfolioVerified ? "pointer" : "default",
              transition: "transform 0.15s ease",
            }}
            onClick={() => {
              if (isPortfolioVerified && githubEvidence) {
                setShowPortfolioModal(true);
              }
            }}
          >
            {getBadgeIcon()}
            <span>{skillName}</span>

            {isPortfolioVerified && (
              <span
                className="badge bg-black bg-opacity-25 ms-1 px-1.5 py-0.5 rounded text-warning"
                style={{ fontSize: "0.72rem" }}
              >
                {githubEvidence?.score || 85}%
              </span>
            )}

            {isSkillVerified && !isPortfolioVerified && assessmentScore && (
              <span
                className="badge bg-black bg-opacity-25 ms-1 px-1.5 py-0.5 rounded text-info"
                style={{ fontSize: "0.72rem" }}
              >
                {assessmentScore}%
              </span>
            )}
          </span>
        </OverlayTrigger>

        {/* Owner Quick Actions */}
        {isOwner && (
          <span className="d-inline-flex align-items-center gap-1">
            {!isSkillVerified && onVerify && (
              <button
                type="button"
                className="btn btn-sm btn-outline-info rounded-pill py-0 px-2"
                style={{ fontSize: "0.72rem" }}
                onClick={() => onVerify(skillName)}
                title="Take Assessment Test"
              >
                ✓ Verify Test
              </button>
            )}

            {isSkillVerified && !isPortfolioVerified && onAddPortfolio && (
              <button
                type="button"
                className="btn btn-sm btn-outline-warning rounded-pill py-0 px-2"
                style={{ fontSize: "0.72rem" }}
                onClick={() => onAddPortfolio(skillName)}
                title="Add GitHub Evidence"
              >
                + GitHub Repo
              </button>
            )}
          </span>
        )}
      </span>

      {isPortfolioVerified && githubEvidence && (
        <PortfolioModal
          show={showPortfolioModal}
          onHide={() => setShowPortfolioModal(false)}
          evidence={githubEvidence}
          skillName={skillName}
        />
      )}
    </>
  );
};

export default SkillBadge;
