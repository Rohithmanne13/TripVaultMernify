"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { HOST } from "@/utils/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const connectSocket = async () => {
      try {
        // Wait for Clerk to be loaded and user to be signed in
        if (!isLoaded || !isSignedIn) {
          console.log("Waiting for authentication...");
          return;
        }

        if (!getToken) {
          console.error("getToken is not available");
          return;
        }

        console.log("Connecting socket with token...");
        socket.current = io(HOST, {
          auth: async (cb) => {
            try {
              const freshToken = await getToken();
              if (!freshToken) {
                console.error("Failed to get authentication token");
                cb({ token: null, type: "user" });
                return;
              }
              cb({ token: freshToken, type: "user" });
            } catch (error) {
              console.error("Error getting token:", error);
              cb({ token: null, type: "user" });
            }
          },
        });

        socket.current.on("connect", () => {
          console.log("Connected to socket");
          setIsConnected(true);
        });

        socket.current.on("disconnect", () => {
          console.log("Disconnected from socket");
          setIsConnected(false);
        });

        socket.current.on("auth-error", (error) => {
          console.error("Socket authentication error:", error);
          toast.error("Authentication failed. Please refresh the page.");
          setIsConnected(false);
        });

        socket.current.on("multiple-connection", (error) => {
          console.error("Same user connected from another device");
          toast.error(error.message || "You are already using this account from another device");
          // router.push("/");
          socket.current.disconnect();
          setIsConnected(false);
        });

      } catch (err) {
        console.error("Failed to connect socket:", err);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [isLoaded, isSignedIn]);

  return (
    <SocketContext.Provider value={{socket, isConnected}}>
      {children}
    </SocketContext.Provider>
  );
};
