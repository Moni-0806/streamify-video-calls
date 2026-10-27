import { useContext } from "react";
import StreamChatContext from "../contexts/streamChatContext";

const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error("useStreamChat must be used within a StreamChatProvider");
  }
  return context;
};

export default useStreamChat;
