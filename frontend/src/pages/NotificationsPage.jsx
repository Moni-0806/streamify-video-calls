import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import useAuthUser from "../hooks/useAuthUser";
import useStreamChat from "../hooks/useStreamChat";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const { chatClient, isReady, streamError } = useStreamChat();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests", authUser?._id],
    queryFn: getFriendRequests,
  });

  const {
    data: unreadChannels = [],
    isLoading: isLoadingUnreadChannels,
    isError: unreadChannelsError,
  } = useQuery({
    queryKey: ["unreadChannels", authUser?._id],
    queryFn: async () => {
      const channels = await chatClient.queryChannels(
        { members: { $in: [authUser._id] } },
        { last_message_at: -1 },
        { limit: 100, state: true, watch: false }
      );
      return channels.filter((channel) => channel.state.unreadCount > 0);
    },
    enabled: Boolean(isReady && chatClient && authUser),
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Notifications</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">{incomingRequests.length}</span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              <img src={request.sender.profilePic} alt={request.sender.fullName} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{request.sender.fullName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(unreadChannels.length > 0 ||
              isLoadingUnreadChannels ||
              unreadChannelsError ||
              streamError ||
              !isReady) && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5 text-primary" />
                Unread Messages
                {!isLoadingUnreadChannels && !unreadChannelsError && (
                  <span className="badge badge-error ml-2">
                    {unreadChannels.reduce(
                      (total, channel) => total + channel.state.unreadCount,
                      0
                    )}
                  </span>
                )}
              </h2>

              {streamError || unreadChannelsError ? (
                <p className="text-sm text-error">
                  Unable to load unread messages. Please try again later.
                </p>
              ) : isLoadingUnreadChannels || !isReady ? (
                <div className="flex justify-center py-6">
                  <span className="loading loading-spinner loading-md" />
                </div>
              ) : unreadChannels.length > 0 ? (
                <div className="space-y-3">
                  {unreadChannels.map((channel) => {
                    const otherMember = Object.values(channel.state.members || {}).find(
                      (member) => member.user?.id !== authUser?._id
                    );
                    const friend = otherMember?.user;
                    const lastMessage = channel.state.messages.at(-1);
                    if (!friend?.id) return null;

                    return (
                      <Link
                        key={channel.cid}
                        to={`/chat/${friend.id}`}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-4 flex-row items-center gap-3">
                          <div className="avatar size-12">
                            <img src={friend.image} alt={friend.name || "Friend"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{friend.name || "Friend"}</h3>
                            <p className="text-sm opacity-70 truncate">
                              {lastMessage?.text || "You have an unread message"}
                            </p>
                          </div>
                          <span className="badge badge-error">
                            {channel.state.unreadCount}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm opacity-70">You have no unread messages.</p>
              )}
            </section>
            )}

            {/* ACCEPTED REQS NOTIFICATONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div key={notification._id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.profilePic}
                              alt={notification.recipient.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{notification.recipient.fullName}</h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullName} accepted your friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 &&
              acceptedRequests.length === 0 &&
              unreadChannels.length === 0 &&
              !isLoadingUnreadChannels &&
              !unreadChannelsError &&
              isReady && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
