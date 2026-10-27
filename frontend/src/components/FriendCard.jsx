import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend, onlineStatus, loadingOnlineStatus }) => {
  return (
    <Link
      to={`/chat/${friend._id}`}
      aria-label={`Open private chat with ${friend.fullName}`}
      className="card bg-base-200 hover:shadow-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{friend.fullName}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs opacity-70">
              <span
                className={`size-2 rounded-full ${
                  onlineStatus === true ? "bg-success" : "bg-base-content/40"
                }`}
              />
              {loadingOnlineStatus
                ? "Checking status..."
                : onlineStatus === true
                  ? "Online"
                  : onlineStatus === false
                    ? "Offline"
                    : "Status unavailable"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>
        <span className="text-sm text-primary font-medium">Open chat</span>
      </div>
    </Link>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
