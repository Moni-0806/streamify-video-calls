import { Link } from "react-router";
import { UsersIcon } from "lucide-react";

const NoFriendsFound = () => {
  return (
    <div className="card bg-base-200 p-6 text-center">
      <h3 className="font-semibold text-lg mb-2">No friends yet</h3>
      <p className="text-base-content opacity-70">
        Meet language partners and start practicing together.
      </p>
      <Link to="/" className="btn btn-primary btn-sm mt-4 self-center">
        <UsersIcon className="size-4 mr-2" />
        Meet New Friends
      </Link>
    </div>
  );
};

export default NoFriendsFound;
