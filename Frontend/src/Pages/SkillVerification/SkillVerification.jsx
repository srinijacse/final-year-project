import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Form,
  Spinner,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaGithub,
  
  FaClock,


  FaCheck,
  FaTimes,
  FaRedo,
  FaCode,
  
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import { assessmentSupportedSkills } from "../../util/Skills";
import SkillBadge from "../../Components/SkillBadge";
import axios from "axios";
import { toast } from "react-toastify";

const SkillVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useUser();

  const paramSkill = searchParams.get("skill");
  const paramTab = searchParams.get("tab");

  const [activeView, setActiveView] = useState("hub");
  const [selectedSkill, setSelectedSkill] = useState(paramSkill || "React");

  // Assessment state
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loadingTest, setLoadingTest] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);

  // GitHub analyzer state
  const [repoUrl, setRepoUrl] = useState("");
  const [githubSkill, setGithubSkill] = useState(paramSkill || "React");
  const [analyzingGithub, setAnalyzingGithub] = useState(false);
  const [githubReport, setGithubReport] = useState(null);

  useEffect(() => {
    if (paramSkill) {
      setSelectedSkill(paramSkill);
      setGithubSkill(paramSkill);

      if (paramTab === "github") {
        setActiveView("github");
      }
    }
  }, [paramSkill, paramTab]);

  // Timer countdown when test is active
  useEffect(() => {
    if (activeView !== "test") return;

    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeView, timeLeft]);

  // Start Assessment Test
  const handleStartTest = async (skillToTest) => {
    const target = skillToTest || selectedSkill;

    setSelectedSkill(target);
    setLoadingTest(true);

    try {
      const { data } = await axios.get(`/assessment/questions/${target}`);

      if (data?.data?.questions) {
        setTestQuestions(data.data.questions);
        setCurrentQIndex(0);
        setUserAnswers({});
        setTimeLeft(data.data.questions.length * 60);
        setActiveView("test");
      }
    } catch (err) {
      toast.error("Failed to load assessment questions for " + target);
    } finally {
      setLoadingTest(false);
    }
  };

  // Submit & Grade Test
  const handleSubmitTest = async () => {
    setSubmittingTest(true);

    try {
      const payloadAnswers = testQuestions.map((q, idx) => ({
        questionId: q.questionId || q.id,
        question: q.question,
        options: q.options,
        selectedAnswer:
          userAnswers[q.questionId || q.id] !== undefined
            ? userAnswers[q.questionId || q.id]
            : -1,
      }));

      const { data } = await axios.post("/assessment/submit", {
        skill: selectedSkill,
        userAnswers: payloadAnswers,
      });

      if (data?.data) {
        setTestResults(data.data);
        setActiveView("results");
        refreshUser();

        if (data.data.passed) {
          toast.success(
            `🎉 Congratulations! You verified your ${selectedSkill} skill!`
          );
        } else {
          toast.warn(
            `You scored ${data.data.percentage}%. 70% is required to verify.`
          );
        }
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit assessment."
      );
    } finally {
      setSubmittingTest(false);
    }
  };

  // Analyze GitHub Repository
  const handleAnalyzeGithub = async (e) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      toast.error("Please enter a valid GitHub repository URL.");
      return;
    }

    setAnalyzingGithub(true);
    setGithubReport(null);

    try {
      const { data } = await axios.post("/portfolio/verify", {
        skill: githubSkill,
        repoUrl: repoUrl.trim(),
      });

      if (data?.data) {
        setGithubReport(data.data);
        refreshUser();

        toast.success(
          `🚀 Portfolio analyzed! Score: ${data.data.portfolioScore}/100. Badge upgraded to Verified + Portfolio!`
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to analyze GitHub repository."
      );
    } finally {
      setAnalyzingGithub(false);
    }
  };

  const teachingSkills = user?.skillsProficientAt || [];

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        color: "#f8fafc",
        minHeight: "92vh",
        paddingBottom: "4rem",
      }}
    >
      <Container
        className="py-4"
        style={{
          maxWidth: activeView === "test" ? "820px" : "1050px",
        }}
      >
        {/* VIEW 1: VERIFICATION HUB OVERVIEW */}
        {activeView === "hub" && (
          <>
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h2
                  className="fw-bold text-light mb-1 d-flex align-items-center gap-2"
                  style={{ fontFamily: "'Josefin Sans', sans-serif" }}
                >
                  <FaCheckCircle
                    className="text-teal"
                    style={{ color: "#3bb4a1" }}
                  />
                  Skill Verification Center
                </h2>

                {/* ONLY COLOR CHANGED */}
                <p
                  className="small mb-0"
                  style={{ color: "#cbd5e1" }}
                >
                  Prove your teaching skills through assessments and GitHub
                  repository evidence to gain credibility and rank higher in
                  peer searches.
                </p>
              </div>

              <Button
                variant="outline-warning"
                onClick={() => setActiveView("github")}
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
              >
                <FaGithub /> GitHub Portfolio Analyzer
              </Button>
            </div>

            {/* Teaching Skills Verification Status Grid */}
            <Card
              className="p-4 border-0 rounded-4 mb-4"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <h5 className="fw-bold text-light mb-1">
                Your Teaching Skills Status
              </h5>

              {/* ONLY COLOR CHANGED */}
              <span
                className="small d-block mb-3"
                style={{ color: "#cbd5e1" }}
              >
                Select any skill below to take its verification assessment or
                add portfolio proof.
              </span>

              {teachingSkills.length === 0 ? (
                /* ONLY COLOR CHANGED */
                <div
                  className="text-center py-4"
                  style={{ color: "#cbd5e1" }}
                >
                  You haven't listed any teaching skills yet.{" "}
                  <Button
                    variant="link"
                    onClick={() => navigate("/edit_profile")}
                    className="text-info p-0"
                  >
                    Add skills in your profile ↗
                  </Button>
                </div>
              ) : (
                <Row className="g-3">
                  {teachingSkills.map((sk, idx) => {
                    const sName =
                      typeof sk === "string" ? sk : sk.name;

                    const status =
                      typeof sk === "object" ? sk.status : "Claimed";

                    const isVerified =
                      status && status.includes("Verified");

                    const isPortfolio =
                      status === "Verified + Portfolio";

                    return (
                      <Col key={idx} md={6} lg={4}>
                        <div
                          className="p-3 rounded-3 border border-secondary border-opacity-25 d-flex flex-column justify-content-between h-100"
                          style={{ backgroundColor: "#0f172a" }}
                        >
                          <div>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className="fw-bold text-light fs-6">
                                {sName}
                              </span>

                              <SkillBadge
                                skill={sk}
                                size="sm"
                              />
                            </div>

                            {/* ONLY COLOR CHANGED */}
                            <div
                              className="small mb-3"
                              style={{ color: "#cbd5e1" }}
                            >
                              {isPortfolio
                                ? `Score: ${
                                    sk.assessmentScore || 90
                                  }% • Portfolio: ${
                                    sk.githubEvidence?.score || 85
                                  }/100`
                                : isVerified
                                ? `Assessment Score: ${
                                    sk.assessmentScore || 85
                                  }%`
                                : "Status: Claimed (Unverified)"}
                            </div>
                          </div>

                          <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
                            <Button
                              variant={
                                isVerified
                                  ? "outline-secondary"
                                  : "info"
                              }
                              size="sm"
                              className={`flex-grow-1 ${
                                !isVerified
                                  ? "text-dark fw-semibold"
                                  : "text-light"
                              }`}
                              style={
                                !isVerified
                                  ? {
                                      backgroundColor: "#3bb4a1",
                                      borderColor: "#3bb4a1",
                                    }
                                  : {}
                              }
                              onClick={() => handleStartTest(sName)}
                              disabled={loadingTest}
                            >
                              {isVerified
                                ? "Retake Test"
                                : "✓ Take Test"}
                            </Button>

                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => {
                                setGithubSkill(sName);
                                setActiveView("github");
                              }}
                              title="Add GitHub Repository Evidence"
                            >
                              <FaGithub />
                            </Button>
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card>

            {/* All Supported Verification Tracks */}
            <Card
              className="p-4 border-0 rounded-4"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <h5 className="fw-bold text-light mb-1">
                Available Skill Assessment Tracks
              </h5>

              {/* ONLY COLOR CHANGED */}
              <span
                className="small d-block mb-3"
                style={{ color: "#cbd5e1" }}
              >
                SkillSwap supports rich multi-difficulty conceptual tests
                across 11 primary disciplines:
              </span>

              <div className="d-flex flex-wrap gap-2">
                {assessmentSupportedSkills.map((sk, idx) => (
                  <Button
                    key={idx}
                    variant="outline-info"
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-light border-secondary"
                    style={{ backgroundColor: "#0f172a" }}
                    onClick={() => handleStartTest(sk)}
                  >
                    <span>{sk}</span>
                    <span className="badge bg-primary bg-opacity-25 text-info">
                      Test ↗
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* VIEW 2: ACTIVE ASSESSMENT TEST ENGINE */}
        {activeView === "test" && (
          <div>
            {/* Test Header with Countdown */}
            <div
              className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <div>
                {/* ONLY COLOR CHANGED */}
                <span
                  className="small d-block"
                  style={{ color: "#cbd5e1" }}
                >
                  Skill Assessment
                </span>

                <h5 className="fw-bold text-light mb-0">
                  {selectedSkill} Knowledge Verification
                </h5>
              </div>

              <div className="d-flex align-items-center gap-2">
                <FaClock className="text-warning" />

                <span className="fw-mono fs-5 fw-bold text-warning">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="mb-3">
              {/* ONLY COLOR CHANGED */}
              <div
                className="d-flex justify-content-between small mb-1"
                style={{ color: "#cbd5e1" }}
              >
                <span>
                  Question {currentQIndex + 1} of{" "}
                  {testQuestions.length}
                </span>

                <span>
                  Answered: {Object.keys(userAnswers).length}/
                  {testQuestions.length}
                </span>
              </div>

              <ProgressBar
                now={
                  ((currentQIndex + 1) /
                    testQuestions.length) *
                  100
                }
                variant="info"
                style={{
                  height: "6px",
                  backgroundColor: "#334155",
                }}
              />
            </div>

            {/* Active Question Card */}
            {testQuestions[currentQIndex] && (
              <Card
                className="p-4 p-md-5 border-0 rounded-4 shadow-lg mb-4"
                style={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Badge
                    bg="secondary"
                    className="px-2 py-1"
                  >
                    {testQuestions[currentQIndex].topic ||
                      "Core Concept"}
                  </Badge>

                  <Badge
                    bg="dark"
                    className="border border-secondary text-info"
                  >
                    {testQuestions[currentQIndex].difficulty ||
                      "Intermediate"}
                  </Badge>
                </div>

                <h4
                  className="fw-bold text-light mb-4"
                  style={{ lineHeight: "1.4" }}
                >
                  {testQuestions[currentQIndex].question}
                </h4>

                {/* Options List */}
                <div className="d-flex flex-column gap-2.5 mb-4">
                  {testQuestions[
                    currentQIndex
                  ].options.map((opt, optIdx) => {
                    const qKey =
                      testQuestions[currentQIndex]
                        .questionId ||
                      testQuestions[currentQIndex].id;

                    const isSelected =
                      userAnswers[qKey] === optIdx;

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-3 cursor-pointer d-flex align-items-center gap-3 transition-all ${
                          isSelected
                            ? "border border-info text-white"
                            : "border border-secondary border-opacity-25 text-light hover-bg-slate"
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(59, 180, 161, 0.15)"
                            : "#0f172a",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onClick={() => {
                          setUserAnswers({
                            ...userAnswers,
                            [qKey]: optIdx,
                          });
                        }}
                      >
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center fw-bold small ${
                            isSelected
                              ? "bg-info text-dark"
                              : "border border-secondary"
                          }`}
                          style={{
                            width: "26px",
                            height: "26px",
                            minWidth: "26px",
                            color: isSelected
                              ? undefined
                              : "#cbd5e1",
                          }}
                        >
                          {String.fromCharCode(
                            65 + optIdx
                          )}
                        </div>

                        <span className="fs-6">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation and Submit Buttons */}
                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                  <Button
                    variant="outline-secondary"
                    disabled={currentQIndex === 0}
                    onClick={() =>
                      setCurrentQIndex(
                        (prev) => prev - 1
                      )
                    }
                    className="text-light px-3"
                  >
                    Previous
                  </Button>

                  {currentQIndex <
                  testQuestions.length - 1 ? (
                    <Button
                      variant="info"
                      className="text-dark fw-semibold px-4"
                      style={{
                        backgroundColor: "#3bb4a1",
                        borderColor: "#3bb4a1",
                      }}
                      onClick={() =>
                        setCurrentQIndex(
                          (prev) => prev + 1
                        )
                      }
                    >
                      Next Question ↗
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      className="px-4 fw-bold shadow"
                      onClick={handleSubmitTest}
                      disabled={submittingTest}
                    >
                      {submittingTest ? (
                        <Spinner
                          animation="border"
                          size="sm"
                        />
                      ) : (
                        "Submit Assessment ✓"
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            <div className="text-center">
              {/* ONLY COLOR CHANGED */}
              <Button
                variant="link"
                className="small"
                style={{ color: "#cbd5e1" }}
                onClick={() => setActiveView("hub")}
              >
                Cancel Test and Return to Hub
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 3: ASSESSMENT RESULTS DASHBOARD */}
        {activeView === "results" && testResults && (
          <div>
            {/* Pass / Fail Banner */}
            <Card
              className="p-4 p-md-5 border-0 rounded-4 shadow-lg text-center mb-4"
              style={{
                backgroundColor: testResults.passed
                  ? "#064e3b"
                  : "#450a0a",
                border: testResults.passed
                  ? "2px solid #10b981"
                  : "2px solid #ef4444",
              }}
            >
              <div className="d-inline-flex p-3 rounded-circle mb-3 bg-black bg-opacity-25">
                {testResults.passed ? (
                  <FaCheckCircle
                    size={48}
                    className="text-success"
                  />
                ) : (
                  <FaTimes
                    size={48}
                    className="text-danger"
                  />
                )}
              </div>

              <h2 className="fw-bold text-light mb-1">
                {testResults.passed
                  ? "✓ Skill Verified Successfully!"
                  : "Assessment Not Passed"}
              </h2>

              <p
                className="text-light opacity-75 mb-4 mx-auto"
                style={{ maxWidth: "500px" }}
              >
                {testResults.passed
                  ? `Congratulations! You scored ${testResults.percentage}%. You have earned the Verified Skill badge for ${testResults.skill}.`
                  : `You scored ${testResults.percentage}%. 70% is required to verify your skill. You can review the explanations below and retake the test at any time.`}
              </p>

              {/* Score Breakdown Pills */}
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <div
                  className="p-3 rounded-3 bg-black bg-opacity-30"
                  style={{ minWidth: "120px" }}
                >
                  {/* ONLY COLOR CHANGED */}
                  <span
                    className="small d-block"
                    style={{ color: "#cbd5e1" }}
                  >
                    Score
                  </span>

                  <span className="fs-3 fw-bold text-light">
                    {testResults.score}/
                    {testResults.totalQuestions}
                  </span>
                </div>

                <div
                  className="p-3 rounded-3 bg-black bg-opacity-30"
                  style={{ minWidth: "120px" }}
                >
                  <span
                    className="small d-block"
                    style={{ color: "#cbd5e1" }}
                  >
                    Percentage
                  </span>

                  <span
                    className={`fs-3 fw-bold ${
                      testResults.passed
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {testResults.percentage}%
                  </span>
                </div>

                <div
                  className="p-3 rounded-3 bg-black bg-opacity-30"
                  style={{ minWidth: "120px" }}
                >
                  <span
                    className="small d-block"
                    style={{ color: "#cbd5e1" }}
                  >
                    Result Status
                  </span>

                  <span
                    className={`fs-4 fw-bold ${
                      testResults.passed
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {testResults.passed
                      ? "Verified ✓"
                      : "Retry Required"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Performance Analytics Breakdown */}
            <Row className="g-4 mb-4">
              {/* Topic-wise Performance */}
              <Col md={6}>
                <Card
                  className="h-100 p-4 border-0 rounded-4"
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                  }}
                >
                  <h5 className="fw-bold text-light mb-3">
                    Topic-Wise Performance
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    {(testResults.topicPerformance || []).map(
                      (tp, idx) => (
                        <div key={idx}>
                          <div className="d-flex justify-content-between text-light small mb-1">
                            <span>{tp.topic}</span>

                            <span className="fw-bold">
                              {tp.correct}/{tp.total} (
                              {tp.percentage}%)
                            </span>
                          </div>

                          <ProgressBar
                            now={tp.percentage}
                            variant={
                              tp.percentage >= 70
                                ? "success"
                                : "warning"
                            }
                            style={{ height: "6px" }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </Col>

              {/* Difficulty-wise Performance */}
              <Col md={6}>
                <Card
                  className="h-100 p-4 border-0 rounded-4"
                  style={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                  }}
                >
                  <h5 className="fw-bold text-light mb-3">
                    Difficulty-Wise Breakdown
                  </h5>

                  <div className="d-flex flex-column gap-3">
                    {(testResults.difficultyPerformance || []).map(
                      (dp, idx) => (
                        <div key={idx}>
                          <div className="d-flex justify-content-between text-light small mb-1">
                            <span>{dp.difficulty}</span>

                            <span className="fw-bold">
                              {dp.correct}/{dp.total} (
                              {dp.percentage}%)
                            </span>
                          </div>

                          <ProgressBar
                            now={dp.percentage}
                            variant={
                              dp.percentage >= 70
                                ? "info"
                                : "danger"
                            }
                            style={{ height: "6px" }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            {/* GitHub Portfolio CTA Banner */}
            <Card
              className="p-4 rounded-4 border border-warning border-opacity-50 mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(20, 83, 45, 0.4) 100%)",
              }}
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h5 className="fw-bold text-light mb-1 d-flex align-items-center gap-2">
                    <FaGithub className="text-warning" />
                    Next Step: Add GitHub Portfolio Evidence
                  </h5>

                  {/* ONLY COLOR CHANGED */}
                  <p
                    className="small mb-0"
                    style={{ color: "#cbd5e1" }}
                  >
                    Do you have a public GitHub repository demonstrating your{" "}
                    {testResults.skill} experience? Upgrade your badge to
                    "Verified + Portfolio"!
                  </p>
                </div>

                <Button
                  variant="warning"
                  className="fw-bold px-4 py-2 text-nowrap text-dark"
                  onClick={() => {
                    setGithubSkill(testResults.skill);
                    setActiveView("github");
                  }}
                >
                  Analyze GitHub Repo ↗
                </Button>
              </div>
            </Card>

            {/* Answer Explanations Review */}
            <Card
              className="p-4 p-md-5 border-0 rounded-4 mb-4"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <h4 className="fw-bold text-light mb-3">
                Review Questions & Explanations
              </h4>

              <div className="d-flex flex-column gap-3">
                {(testResults.answers || []).map(
                  (ans, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-3 border"
                      style={{
                        backgroundColor: "#0f172a",
                        borderColor: ans.isCorrect
                          ? "#059669"
                          : "#dc2626",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-secondary small">
                          Question {idx + 1}
                        </span>

                        <span
                          className={`fw-bold small ${
                            ans.isCorrect
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {ans.isCorrect
                            ? "✓ Correct"
                            : "✕ Incorrect"}
                        </span>
                      </div>

                      <h6 className="fw-bold text-light mb-2">
                        {ans.question}
                      </h6>

                      {/* ONLY COLOR CHANGED */}
                      <div
                        className="small mb-2"
                        style={{ color: "#cbd5e1" }}
                      >
                        <div>
                          Your Answer:{" "}
                          <strong
                            className={
                              ans.isCorrect
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {ans.options[
                              ans.selectedAnswer
                            ] || "No answer"}
                          </strong>
                        </div>

                        {!ans.isCorrect && (
                          <div>
                            Correct Answer:{" "}
                            <strong className="text-success">
                              {
                                ans.options[
                                  ans.correctAnswer
                                ]
                              }
                            </strong>
                          </div>
                        )}
                      </div>

                      {ans.explanation && (
                        <div
                          className="p-2.5 rounded text-info small"
                          style={{
                            backgroundColor: "#1e293b",
                          }}
                        >
                          💡 <strong>Explanation:</strong>{" "}
                          {ans.explanation}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>

            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-light"
                onClick={() => setActiveView("hub")}
                className="px-4 py-2"
              >
                Back to Verification Hub
              </Button>

              <Button
                variant="info"
                onClick={() =>
                  handleStartTest(testResults.skill)
                }
                className="px-4 py-2 text-dark fw-semibold"
                style={{
                  backgroundColor: "#3bb4a1",
                  borderColor: "#3bb4a1",
                }}
              >
                <FaRedo className="me-1" /> Retake Test
              </Button>
            </div>
          </div>
        )}

        {/* VIEW 4: GITHUB PORTFOLIO EVIDENCE ANALYZER */}
        {activeView === "github" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setActiveView("hub")}
                className="text-light"
              >
                ← Back to Hub
              </Button>

              <h3
                className="fw-bold text-light mb-0"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                }}
              >
                GitHub Portfolio Evidence Analyzer
              </h3>

              <div style={{ width: "80px" }}></div>
            </div>

            <Card
              className="p-4 p-md-5 border-0 rounded-4 shadow-lg mb-4"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-2">
                  <FaGithub size={36} />
                </div>

                <h4 className="fw-bold text-light">
                  Verify Project Portfolio Evidence
                </h4>

                {/* ONLY COLOR CHANGED */}
                <p
                  className="small mx-auto"
                  style={{
                    maxWidth: "550px",
                    color: "#cbd5e1",
                  }}
                >
                  Provide a public GitHub repository link demonstrating your
                  practical experience. SkillSwap will inspect code structure,
                  dependency trees, and project implementations to award you
                  portfolio evidence badges.
                </p>
              </div>

              <Form onSubmit={handleAnalyzeGithub}>
                <Row className="g-3 mb-4">
                  <Col md={4}>
                    <Form.Group>
                      {/* ONLY COLOR CHANGED */}
                      <Form.Label
                        className="small fw-semibold"
                        style={{ color: "#cbd5e1" }}
                      >
                        Claimed Skill *
                      </Form.Label>

                      <Form.Select
                        value={githubSkill}
                        onChange={(e) =>
                          setGithubSkill(e.target.value)
                        }
                        style={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          color: "#fff",
                          padding: "0.75rem",
                        }}
                        required
                      >
                        {teachingSkills.map((s, i) => {
                          const sName =
                            typeof s === "string"
                              ? s
                              : s.name;

                          return (
                            <option
                              key={i}
                              value={sName}
                            >
                              {sName}
                            </option>
                          );
                        })}

                        {assessmentSupportedSkills.map(
                          (s, i) => (
                            <option
                              key={i + 100}
                              value={s}
                            >
                              {s}
                            </option>
                          )
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={8}>
                    <Form.Group>
                      {/* ONLY COLOR CHANGED */}
                      <Form.Label
                        className="small fw-semibold"
                        style={{ color: "#cbd5e1" }}
                      >
                        Public GitHub Repository URL *
                      </Form.Label>

                      <Form.Control
                        type="text"
                        placeholder="e.g. github.com/facebook/react or https://github.com/username/project"
                        value={repoUrl}
                        onChange={(e) =>
                          setRepoUrl(e.target.value)
                        }
                        style={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          color: "#fff",
                          padding: "0.75rem",
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  size="lg"
                  className="w-100 py-3 fw-bold border-0 rounded-3 text-dark d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: "#3bb4a1" }}
                  disabled={analyzingGithub}
                >
                  {analyzingGithub ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                      />
                      <span>
                        Analyzing Repository Dependencies &
                        Architecture...
                      </span>
                    </>
                  ) : (
                    <>
                      <FaCode />
                      <span>
                        Analyze Repository Evidence
                      </span>
                    </>
                  )}
                </Button>
              </Form>
            </Card>

            {/* Analysis Report Card */}
            {githubReport && (
              <Card
                className="p-4 p-md-5 border-0 rounded-4 shadow-lg"
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #10b981",
                }}
              >
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                  <div>
                    <Badge
                      bg="success"
                      className="px-3 py-1.5 fs-6 mb-1"
                    >
                      ✓ Verified + Portfolio Evidence Awarded!
                    </Badge>

                    <h4 className="fw-bold text-light mt-2 mb-0">
                      {githubReport.skill}
                    </h4>

                    <a
                      href={githubReport.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-info small text-decoration-none"
                    >
                      {githubReport.repoName} ↗
                    </a>
                  </div>

                  <div className="text-end">
                    {/* ONLY COLOR CHANGED */}
                    <span
                      className="small d-block"
                      style={{ color: "#cbd5e1" }}
                    >
                      Portfolio Evidence Score
                    </span>

                    <span className="fs-2 fw-bold text-success">
                      {githubReport.portfolioScore}/100
                    </span>
                  </div>
                </div>

                {/* Detected Technologies */}
                <div className="mb-4">
                  {/* ONLY COLOR CHANGED */}
                  <h6
                    className="text-uppercase fw-bold small mb-2"
                    style={{ color: "#cbd5e1" }}
                  >
                    Detected Technologies & Stack
                  </h6>

                  <div className="d-flex flex-wrap gap-2">
                    {(githubReport.detectedTech || []).map(
                      (t, idx) => (
                        <Badge
                          key={idx}
                          bg="dark"
                          className="border border-secondary px-3 py-2 fs-6 text-light"
                        >
                          {t}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                {/* Evidence Checklist */}
                <div className="mb-4">
                  {/* ONLY COLOR CHANGED */}
                  <h6
                    className="text-uppercase fw-bold small mb-2"
                    style={{ color: "#cbd5e1" }}
                  >
                    Verification Checklist
                  </h6>

                  <div
                    className="p-3 rounded-3"
                    style={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  >
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {(githubReport.evidenceItems || []).map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="d-flex align-items-center gap-2 text-light small"
                          >
                            <FaCheck className="text-success" />
                            <span>
                              {item.replace(/^✓\s*/, "")}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    as={Link}
                    to={`/profile/${user.username}`}
                    variant="outline-light"
                  >
                    View on Your Profile ↗
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default SkillVerification;