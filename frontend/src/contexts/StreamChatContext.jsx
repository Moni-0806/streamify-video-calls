import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import StreamChatContext from "./streamChatContext";
import { getFriendRequests, getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
let sharedStreamClient;
let sharedConnectionPromise;

const StreamChatProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [chatClient, setChatClient] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [streamError, setStreamError] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  const {
    data: tokenData,
    isError: tokenError,
    isLoading: tokenLoading,
    refetch: refetchToken,
  } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: getStreamToken,
    enabled: Boolean(authUser),
    retry: false,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests", authUser?._id],
    queryFn: getFriendRequests,
    enabled: Boolean(authUser),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    let cancelled = false;
    let client;
    let handleMessageNotification;
    let handleFriendRequestNotification;

    const connect = async () => {
      if (!authUser) {
        setChatClient(null);
        setIsReady(false);
        setUnreadCount(0);
        setStreamError(false);
        if (sharedStreamClient?.userID) await sharedStreamClient.disconnectUser();
        return;
      }

      setIsReady(false);
      setStreamError(false);

      if (tokenError) {
        setStreamError(true);
        return;
      }

      if (!tokenData?.token) {
        if (!tokenLoading) setStreamError(true);
        return;
      }

      try {
        if (!STREAM_API_KEY) {
          throw new Error("Stream Chat API key is not configured");
        }

        sharedStreamClient ??= StreamChat.getInstance(STREAM_API_KEY);
        client = sharedStreamClient;

        if (sharedConnectionPromise) {
          await sharedConnectionPromise;
        }

        if (client.userID !== authUser._id) {
          if (client.userID) await client.disconnectUser();
          const connection = client.connectUser(
            { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
            tokenData.token
          );
          sharedConnectionPromise = connection;
          try {
            await connection;
          } finally {
            if (sharedConnectionPromise === connection) sharedConnectionPromise = undefined;
          }
        } else if (client.setUserPromise) {
          await client.setUserPromise;
        }

        if (cancelled) return;

        const refreshUnreadCount = async () => {
          const counts = await client.getUnreadCount();
          if (!cancelled) setUnreadCount(counts.total_unread_count);
          queryClient.invalidateQueries({ queryKey: ["unreadChannels"] });
        };
        handleMessageNotification = () => {
          refreshUnreadCount().catch((error) => {
            console.error("Unable to refresh unread message count:", error);
          });
        };
        handleFriendRequestNotification = () => {
          queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        };

        client.on("notification.message_new", handleMessageNotification);
        client.on("notification.added_to_channel", handleMessageNotification);
        client.on("message.new", handleMessageNotification);
        client.on("notification.mark_read", handleMessageNotification);
        client.on("connection.recovered", handleMessageNotification);
        client.on("friend_request.new", handleFriendRequestNotification);
        setChatClient(client);
        setIsReady(true);
        setStreamError(false);

        refreshUnreadCount().catch((error) => {
          console.error("Unable to load initial unread message count:", error);
        });
      } catch (error) {
        if (client?.userID === authUser._id) {
          try {
            await client.disconnectUser();
          } catch (disconnectError) {
            console.error("Unable to clean up failed Stream connection:", disconnectError);
          }
        }
        if (!cancelled) {
          console.error("Unable to connect to Stream Chat:", error);
          setStreamError(true);
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (client) {
        if (handleMessageNotification) {
          client.off("notification.message_new", handleMessageNotification);
          client.off("notification.added_to_channel", handleMessageNotification);
          client.off("message.new", handleMessageNotification);
          client.off("notification.mark_read", handleMessageNotification);
          client.off("connection.recovered", handleMessageNotification);
        }
        if (handleFriendRequestNotification) {
          client.off("friend_request.new", handleFriendRequestNotification);
        }
      }
    };
  }, [authUser, tokenData?.token, tokenError, tokenLoading, queryClient, connectionAttempt]);

  const value = {
    chatClient,
    isReady,
    streamError,
    unreadCount,
    incomingFriendRequestCount: friendRequests?.incomingReqs?.length ?? 0,
    retryConnection: async () => {
      setStreamError(false);
      setIsReady(false);
      const { data } = await refetchToken();
      if (!data?.token) {
        setStreamError(true);
        return;
      }
      setConnectionAttempt((attempt) => attempt + 1);
    },
  };

  return <StreamChatContext.Provider value={value}>{children}</StreamChatContext.Provider>;
};

export default StreamChatProvider;
