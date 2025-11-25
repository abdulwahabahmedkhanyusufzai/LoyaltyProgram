import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WebsocketEventEnum } from "../../../types/socket";

const useWebSocketConnectionHook = (
  cb: (arg: unknown) => void,
  event: WebsocketEventEnum
) => {
  // socket reference
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // connect to server with explicit URL and CORS support
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected with ID:", socket.id);

      // subscribe to your custom event
      socket.on(event as string, (data) => {
        cb(data);
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err.message);
      // Do not fetch localhost here; it causes 404 & CORS issues
    });

    socketRef.current = socket;

    // clean up on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [cb, event]);

  return socketRef;
};

export default useWebSocketConnectionHook;
