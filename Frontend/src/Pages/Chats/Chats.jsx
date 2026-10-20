import { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaPaperPlane,
  FaCalendarAlt,
  FaUser,
  FaComments,
  FaSearch,
  FaArrowLeft,
} from "react-icons/fa";
import { useUser } from "../../util/UserContext";
import { useSocket } from "../../util/SocketContext";
import ScheduleSessionModal from "../../Components/ScheduleSessionModal";
import axios from "axios";
import { toast } from "react-toastify";

const Chats = () => {
  const { user } = useUser();
  const { socket, socketConnected, isUserOnline, joinChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all user chats
  const fetchChats = async () => {
    try {
      setLoadingChats(true);

      const { data } = await axios.get("/chat");

      if (data?.data) {
        setChats(data.data);

        if (data.data.length > 0 && !selectedChat) {
          setSelectedChat(data.data[0]);
        }
      }
    } catch (err) {
      console.log("Error loading chats:", err);
      toast.error("Could not load chats.");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user?._id]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);

        const { data } = await axios.get(
          `/message/${selectedChat._id}`
        );

        if (data?.data) {
          setMessages(data.data);
          joinChat(selectedChat._id);
        }
      } catch (err) {
        console.log("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();
  }, [selectedChat?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMsg) => {
      if (
        !selectedChat ||
        (selectedChat._id !== newMsg.chatId._id &&
          selectedChat._id !== newMsg.chatId)
      ) {
        // Notification for another chat
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === newMsg.chatId._id ||
            c._id === newMsg.chatId
              ? { ...c, latestMessage: newMsg }
              : c
          )
        );
      } else {
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 50);
      }
    };

    const typingHandler = ({ chat, senderName }) => {
      if (selectedChat && selectedChat._id === chat) {
        setIsTyping(true);
        setTypingUser(senderName || "Peer");
      }
    };

    const stopTypingHandler = ({ chat }) => {
      if (selectedChat && selectedChat._id === chat) {
        setIsTyping(false);
        setTypingUser("");
      }
    };

    socket.on("message received", messageHandler);
    socket.on("message recieved", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);

    return () => {
      socket.off("message received", messageHandler);
      socket.off("message recieved", messageHandler);
      socket.off("typing", typingHandler);
      socket.off("stop typing", stopTypingHandler);
    };
  }, [socket, selectedChat?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat?._id) return;

    if (socket && selectedChat) {
      socket.emit("stop typing", {
        chat: selectedChat._id,
      });
    }

    const msgContent = newMessage.trim();

    setNewMessage("");

    try {
      const { data } = await axios.post("/message", {
        chatId: selectedChat._id,
        content: msgContent,
      });

      if (data?.data) {
        const sentMsg = data.data;

        setMessages((prev) => [...prev, sentMsg]);

        // Emit to socket
        if (socket) {
          socket.emit("new message", sentMsg);
        }

        // Update latest message in chat list
        setChats((prev) =>
          prev.map((c) =>
            c._id === selectedChat._id
              ? { ...c, latestMessage: sentMsg }
              : c
          )
        );

        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to send message."
      );
    }
  };

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedChat) return;

    socket.emit("typing", {
      chat: selectedChat._id,
      senderName: user.name?.split(" ")[0],
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", {
        chat: selectedChat._id,
      });
    }, 2000);
  };

  const getPartner = (chat) => {
    if (!chat || !chat.users) return null;

    return (
      chat.users.find(
        (u) =>
          u._id?.toString() !== user?._id?.toString()
      ) || chat.users[0]
    );
  };

  const currentPartner = selectedChat
    ? getPartner(selectedChat)
    : null;

  const isPartnerOnline = currentPartner
    ? isUserOnline(currentPartner._id)
    : false;

  const filteredChats = chats.filter((c) => {
    const p = getPartner(c);

    if (!p) return false;

    const sTerm = searchFilter.toLowerCase().trim();

    return (
      (p.name || "").toLowerCase().includes(sTerm) ||
      (p.username || "").toLowerCase().includes(sTerm)
    );
  });

  return (
    <div
      style={{
        backgroundColor: "#0b1120",
        color: "#f8fafc",
        minHeight: "92vh",
      }}
    >
      <Container fluid className="px-lg-4 py-3">
        <Row
          className="g-3"
          style={{
            height: "calc(92vh - 2rem)",
          }}
        >
          {/* =====================================================
              LEFT SIDEBAR
          ====================================================== */}

          <Col
            md={4}
            lg={3}
            className={`d-flex flex-column h-100 ${
              selectedChat
                ? "d-none d-md-flex"
                : "d-flex"
            }`}
          >
            <Card
              className="h-100 border-0 rounded-4 shadow-sm overflow-hidden d-flex flex-column"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              {/* Header */}

              <div className="p-3 border-bottom border-secondary border-opacity-25">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold text-light mb-0 d-flex align-items-center gap-2">
                    <FaComments className="text-info" />
                    Conversations
                  </h5>

                  <Badge
                    bg="dark"
                    className="border border-secondary"
                  >
                    {chats.length}
                  </Badge>
                </div>

                <InputGroup size="sm">
                  <InputGroup.Text
                    style={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#94a3b8",
                    }}
                  >
                    <FaSearch />
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    className="chat-search"
                    placeholder="Search chats..."
                    value={searchFilter}
                    onChange={(e) =>
                      setSearchFilter(e.target.value)
                    }
                    style={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                  />
                </InputGroup>
              </div>

              {/* Chat list */}

              <div className="flex-grow-1 overflow-auto p-2 d-flex flex-column gap-1">
                {loadingChats ? (
                  <div
                    className="text-center py-4"
                    style={{ color: "#94a3b8" }}
                  >
                    <Spinner
                      animation="border"
                      size="sm"
                      variant="info"
                    />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div
                    className="text-center py-5 small px-3"
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    No active chats. Connect with peers
                    from Discover to start messaging.
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const partner = getPartner(chat);

                    const isOnline = partner
                      ? isUserOnline(partner._id)
                      : false;

                    const isSelected =
                      selectedChat?._id === chat._id;

                    return (
                      <div
                        key={chat._id}
                        className={`p-2.5 rounded-3 cursor-pointer transition-all d-flex align-items-center gap-3 ${
                          isSelected
                            ? "bg-primary bg-opacity-25 border border-info border-opacity-50"
                            : "hover-bg-slate"
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? "#0f172a"
                            : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          setSelectedChat(chat)
                        }
                      >
                        <div className="position-relative">
                          <img
                            src={
                              partner?.picture ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            }
                            alt={partner?.name}
                            className="rounded-circle"
                            style={{
                              width: "44px",
                              height: "44px",
                              objectFit: "cover",
                            }}
                          />

                          <span
                            className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                            style={{
                              width: "11px",
                              height: "11px",
                              backgroundColor: isOnline
                                ? "#10b981"
                                : "#64748b",
                            }}
                          />
                        </div>

                        <div className="overflow-hidden flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold text-light text-truncate small d-block">
                              {partner?.name || "Peer"}
                            </span>

                            <span
                              style={{
                                fontSize: "0.68rem",
                                color: "#94a3b8",
                              }}
                            >
                              {chat.updatedAt
                                ? new Date(
                                    chat.updatedAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""}
                            </span>
                          </div>

                          <span
                            className="text-truncate d-block small"
                            style={{
                              fontSize: "0.76rem",
                              color: "#94a3b8",
                            }}
                          >
                            {chat.latestMessage?.content ||
                              "Tap to chat..."}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </Col>

          {/* =====================================================
              RIGHT MAIN CHAT WINDOW
          ====================================================== */}

          <Col
            md={8}
            lg={9}
            className={`h-100 ${
              !selectedChat
                ? "d-none d-md-block"
                : "d-block"
            }`}
          >
            <Card
              className="h-100 border-0 rounded-4 shadow-sm overflow-hidden d-flex flex-column"
              style={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
              }}
            >
              {selectedChat && currentPartner ? (
                <>
                  {/* =================================================
                      CHAT HEADER
                  ================================================== */}

                  <div
                    className="p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: "#0f172a",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Button
                        variant="link"
                        className="text-light p-0 d-md-none me-1"
                        onClick={() =>
                          setSelectedChat(null)
                        }
                      >
                        <FaArrowLeft size={18} />
                      </Button>

                      <div className="position-relative">
                        <img
                          src={
                            currentPartner.picture ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                          }
                          alt={currentPartner.name}
                          className="rounded-circle"
                          style={{
                            width: "44px",
                            height: "44px",
                            objectFit: "cover",
                          }}
                        />

                        <span
                          className="position-absolute bottom-0 end-0 rounded-circle border border-dark"
                          style={{
                            width: "11px",
                            height: "11px",
                            backgroundColor:
                              isPartnerOnline
                                ? "#10b981"
                                : "#64748b",
                          }}
                        />
                      </div>

                      <div>
                        <h6 className="fw-bold text-light mb-0">
                          {currentPartner.name}
                        </h6>

                        <span
                          className="small"
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          {isPartnerOnline ? (
                            <span className="text-success fw-semibold">
                              ● Online
                            </span>
                          ) : (
                            "Offline"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/profile/${currentPartner.username}`}
                        variant="outline-secondary"
                        size="sm"
                        className="text-light"
                      >
                        <FaUser className="me-1" />
                        Profile
                      </Button>

                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() =>
                          setShowScheduleModal(true)
                        }
                        className="d-flex align-items-center gap-1"
                      >
                        <FaCalendarAlt />
                        Schedule Session
                      </Button>
                    </div>
                  </div>

                  {/* =================================================
                      MESSAGES STREAM
                  ================================================== */}

                  <div
                    className="flex-grow-1 overflow-auto p-3 p-md-4 d-flex flex-column gap-2"
                    style={{
                      backgroundColor: "#090d16",
                    }}
                  >
                    {loadingMessages ? (
                      <div
                        className="text-center py-5"
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        <Spinner
                          animation="border"
                          size="sm"
                          variant="info"
                        />
                      </div>
                    ) : messages.length === 0 ? (
                      <div
                        className="text-center py-5 my-auto"
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        <FaComments
                          size={36}
                          style={{
                            color: "#64748b",
                            opacity: 0.7,
                          }}
                          className="mb-2"
                        />

                        <p
                          className="small mb-0"
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          No messages yet. Say hello and
                          exchange knowledge!
                        </p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe =
                          m.sender?._id?.toString() ===
                            user?._id?.toString() ||
                          m.sender?.toString() ===
                            user?._id?.toString();

                        return (
                          <div
                            key={m._id}
                            className={`d-flex flex-column ${
                              isMe
                                ? "align-items-end"
                                : "align-items-start"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-4 shadow-sm text-wrap ${
                                isMe
                                  ? "text-dark"
                                  : "text-light"
                              }`}
                              style={{
                                maxWidth: "70%",
                                backgroundColor: isMe
                                  ? "#3bb4a1"
                                  : "#1e293b",
                                border: isMe
                                  ? "none"
                                  : "1px solid #334155",
                                borderBottomRightRadius:
                                  isMe
                                    ? "4px"
                                    : "16px",
                                borderBottomLeftRadius:
                                  !isMe
                                    ? "4px"
                                    : "16px",
                                fontSize: "0.92rem",
                                wordBreak: "break-word",
                              }}
                            >
                              {m.content}
                            </div>

                            <span
                              className="mt-1 px-1"
                              style={{
                                fontSize: "0.68rem",
                                color: "#94a3b8",
                              }}
                            >
                              {m.createdAt
                                ? new Date(
                                    m.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""}
                            </span>
                          </div>
                        );
                      })
                    )}

                    {isTyping && (
                      <div
                        className="align-self-start small fst-italic px-2"
                        style={{
                          color: "#94a3b8",
                        }}
                      >
                        {typingUser} is typing...
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* =================================================
                      MESSAGE INPUT FOOTER
                  ================================================== */}

                  <div
                    className="p-3 border-top border-secondary border-opacity-25"
                    style={{
                      backgroundColor: "#0f172a",
                    }}
                  >
                    <Form
                      onSubmit={handleSendMessage}
                      className="d-flex gap-2"
                    >
                      <Form.Control
                        type="text"
                        className="chat-message-input"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={handleTypingInput}
                        style={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          color: "#fff",
                          padding: "0.75rem",
                        }}
                      />

                      <Button
                        type="submit"
                        className="px-4 border-0 text-dark fw-bold d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: "#3bb4a1",
                        }}
                      >
                        <FaPaperPlane />
                      </Button>
                    </Form>
                  </div>
                </>
              ) : (
                /* =================================================
                   NO CHAT SELECTED
                ================================================== */

                <div
                  className="text-center py-5 my-auto"
                  style={{
                    color: "#94a3b8",
                  }}
                >
                  <FaComments
                    size={48}
                    style={{
                      color: "#64748b",
                      opacity: 0.7,
                    }}
                    className="mb-3"
                  />

                  <h5
                    style={{
                      color: "#f8fafc",
                    }}
                  >
                    Select a conversation
                  </h5>

                  <p
                    className="small mb-0"
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    Choose a connected peer on the left
                    to start chatting in real-time.
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* =====================================================
          SESSION MODAL
      ====================================================== */}

      {currentPartner && (
        <ScheduleSessionModal
          show={showScheduleModal}
          onHide={() =>
            setShowScheduleModal(false)
          }
          partner={currentPartner}
        />
      )}

      {/* =====================================================
          PLACEHOLDER COLOR FIX
      ====================================================== */}

      <style>
        {`
          .chat-search::placeholder {
            color: #94a3b8 !important;
            opacity: 1;
          }

          .chat-message-input::placeholder {
            color: #94a3b8 !important;
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default Chats;