import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
const useWebSocketConnectionHook = (cb, event) => {
    // socket reference
    const socketRef = useRef(null);
    // memoized socket initializer
    const initSocket = useCallback(() => {
        const socket = io("http://localhost:4000", {
            transports: ["websocket"],
            autoConnect: true,
        });
        socket.on("connect", () => {
            console.log("Socket connected with ID:", socket.id);
            // subscribe to your custom event
            socket.on(event, (data) => {
                cb(data);
            });
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
        socket.on("connect_error", (err) => {
            console.error("Socket connect_error:", err.message);
            // No fetch here to avoid CORS/404 issues
        });
        socketRef.current = socket;
    }, [cb, event]);
    useEffect(() => {
        initSocket();
        // cleanup on unmount
        return () => {
            socketRef.current?.disconnect();
        };
    }, [initSocket]);
    return socketRef;
};
export default useWebSocketConnectionHook;
