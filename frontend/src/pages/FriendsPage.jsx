import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { BellIcon } from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import useStreamChat from "../hooks/useStreamChat";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const { chatClient, isReady } = useStreamChat();
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  const friendIds = friends.map((friend) => friend._id);

  const {
    data: friendsOnlineStatus = {},
    isError: onlineStatusError,
    isLoading: loadingOnlineStatus,
  } = useQuery({
    queryKey: ["friendsOnlineStatus", friendIds],
    queryFn: async () => {
      const { users } = await chatClient.queryUsers(
        { id: { $in: friendIds } },
        [],
        { presence: true, limit: friendIds.length },
      );
      return Object.fromEntries(users.map(({ id, online }) => [id, online]));
    },
    enabled: !isLoading && isReady && Boolean(chatClient) && friendIds.length > 0,
    refetchInterval: 30_000,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h1>
            <p className="opacity-70 mt-1">Stay connected with your language partners.</p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <BellIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                onlineStatus={onlineStatusError ? null : friendsOnlineStatus[friend._id]}
                loadingOnlineStatus={loadingOnlineStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
