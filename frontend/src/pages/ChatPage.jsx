import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import useStreamChat from "../hooks/useStreamChat";

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channelError, setChannelError] = useState(false);
  const [retryChannel, setRetryChannel] = useState(0);

  const { authUser } = useAuthUser();
  const { chatClient, isReady, streamError, retryConnection } = useStreamChat();

  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      if (!isReady || !chatClient || !authUser || !targetUserId) {
        setLoading(true);
        return;
      }

      setLoading(true);
      setChannel(null);
      setChannelError(false);
      try {
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        if (!cancelled) setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (!cancelled) setChannelError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initChat();
    return () => {
      cancelled = true;
    };
  }, [chatClient, isReady, authUser, targetUserId, retryChannel]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (streamError || channelError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Chat couldn’t connect</h1>
        <p className="max-w-md text-sm text-base-content/70">
          Check your connection and try again. Your messages and conversations are unchanged.
        </p>
        {streamError ? (
          <button type="button" className="btn btn-primary" onClick={retryConnection}>
            Retry connection
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setRetryChannel((attempt) => attempt + 1)}
          >
            Try opening chat again
          </button>
        )}
        <Link to="/friends" className="btn btn-ghost btn-sm">
          Back to friends
        </Link>
      </div>
    );
  }

  if (loading || !isReady || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[calc(100dvh-4rem)] min-h-[24rem] w-full min-w-0 overflow-hidden">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="relative h-full w-full min-w-0">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
