import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  CircleHelpIcon,
  HomeIcon,
  PaletteIcon,
  ShieldCheckIcon,
  ShipWheelIcon,
  UsersIcon,
} from "lucide-react";
import useStreamChat from "../hooks/useStreamChat";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const { incomingFriendRequestCount, unreadCount } = useStreamChat();
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationCount = incomingFriendRequestCount + unreadCount;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Streamify
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          aria-label={`Notifications, ${notificationCount} unread`}
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <span className="relative">
            <BellIcon className="size-5 text-base-content opacity-70" />
            {notificationCount > 0 && (
              <span className="badge badge-error badge-xs absolute -right-3 -top-2">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </span>
          <span>Notifications</span>
        </Link>

        <div className="divider my-3 text-xs opacity-50">ACCOUNT</div>

        {[
          { path: "/settings/settings", label: "Settings", icon: PaletteIcon },
          { path: "/settings/privacy", label: "Privacy & Security", icon: ShieldCheckIcon },
          { path: "/settings/switch-account", label: "Switch Account", icon: UsersIcon },
          { path: "/settings/help", label: "Help & Feedback", icon: CircleHelpIcon },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === item.path ? "btn-active" : ""
            }`}
            aria-current={currentPath === item.path ? "page" : undefined}
          >
            <item.icon className="size-5 text-base-content opacity-70" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
