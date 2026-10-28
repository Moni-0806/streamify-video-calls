import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import useStreamChat from "../hooks/useStreamChat";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const { incomingFriendRequestCount, unreadCount } = useStreamChat();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const notificationCount = incomingFriendRequestCount + unreadCount;

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="sticky top-0 z-30 flex h-16 items-center border-b border-base-300 bg-base-200">
      <div className="container mx-auto min-w-0 px-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="min-w-0">
              <Link to="/" className="flex items-center gap-2.5">
                <ShipWheelIcon className="size-7 shrink-0 text-primary sm:size-9" />
                <span className="hidden text-2xl font-bold font-mono tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary sm:inline lg:text-3xl">
                  Streamify
                </span>
              </Link>
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-2">
            <Link
              to="/notifications"
              className="btn btn-ghost btn-circle relative"
              aria-label={`Notifications, ${notificationCount} unread`}
            >
              <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              {notificationCount > 0 && (
                <span className="badge badge-error badge-xs absolute -right-1 -top-1">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>
          </div>

          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
