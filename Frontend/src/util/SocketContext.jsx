import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useUser } from "./UserContext";
import { toast } from "react-toastify";

const SocketContext = createContext();

const SOCKET_ENDPOINT = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_ENDPOINT, {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      transports: ["websocket"],
      agent: false,
      upgrade: false,
      rejectUnauthorized: false,
    });

    newSocket.on("connect", () => {
      console.log("Socket.io connected with ID:", newSocket.id);
      newSocket.emit("setup", user);
    });

    newSocket.on("connected", () => {
      setSocketConnected(true);
    });

    newSocket.on("get-online-users", (usersList) => {
      setOnlineUsers(usersList || []);
    });

    newSocket.on("notification received", (notif) => {
      if (notif?.title) {
        toast.info(`🔔 ${notif.title}: ${notif.message}`, {
          autoClose: 5000,
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  const joinChat = (chatId) => {
    if (socket && chatId) {
      socket.emit("join chat", chatId);
    }
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId.toString());
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketConnected,
        onlineUsers,
        isUserOnline,
        joinChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
