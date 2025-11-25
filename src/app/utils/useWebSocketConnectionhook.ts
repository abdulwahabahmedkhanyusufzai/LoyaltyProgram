import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { WebsocketEventEnum } from "../types/socket";

const useWebSocketConnectionHook = (cb: (arg: unknown) => void, event: WebsocketEventEnum)=> {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function socketClient() {
    const socket = io({
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.on(event as unknown as string, (data) => {
        cb(data);
      });
      console.log("Connected");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    socket.on("connect_error", async (err) => {
      console.log(`connect_error due to ${err.message}`);
      await fetch('/api/socket');
    });

  
    socketRef.current = socket;
  }

  useEffect(() => {
    socketClient();
    return ()=> {
      socketRef?.current?.disconnect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


}

export default useWebSocketConnectionHook;