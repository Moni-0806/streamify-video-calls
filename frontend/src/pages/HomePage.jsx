import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  completeOnboarding,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../lib/api";
import {
  CheckCircleIcon,
  LoaderIcon,
  MapPinIcon,
  PencilIcon,
  ShuffleIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";

import { capitialize } from "../lib/utils";

import { getLanguageFlag } from "../components/FriendCard";
import useAuthUser from "../hooks/useAuthUser";
import { LANGUAGES } from "../constants";
import { processProfileImage } from "../lib/profileImage";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const { authUser } = useAuthUser();

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  const { mutate: updateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["authUser"], (current) => ({ ...current, user }));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to update your profile");
    },
  });

  const handleEditProfile = () => {
    setProfileForm({
      fullName: authUser?.fullName || "",
      bio: authUser?.bio || "",
      nativeLanguage: authUser?.nativeLanguage || "",
      learningLanguage: authUser?.learningLanguage || "",
      location: authUser?.location || "",
      profilePic: authUser?.profilePic || "",
    });
    setIsEditingProfile(true);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    updateProfile(
      Object.fromEntries(
        Object.entries(profileForm).map(([field, value]) => [
          field,
          typeof value === "string" ? value.trim() : value,
        ])
      )
    );
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    setProfileForm((current) => ({
      ...current,
      profilePic: `https://avatar.iran.liara.run/public/${idx}.png`,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const profilePic = await processProfileImage(file);
      setProfileForm((current) => ({ ...current, profilePic }));
    } catch (error) {
      toast.error(error.message || "Unable to process this image");
    }
  };

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        <section className="card bg-base-200 shadow-sm">
          <div className="card-body sm:flex-row sm:items-center gap-5">
            <div className="avatar size-20 shrink-0">
              <img src={authUser?.profilePic} alt={authUser?.fullName || "Your profile"} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {authUser?.fullName}!
              </h1>
              {authUser?.bio && <p className="mt-2 opacity-70">{authUser.bio}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {authUser?.location && (
                  <span className="badge badge-ghost gap-1">
                    <MapPinIcon className="size-3" />
                    {authUser.location}
                  </span>
                )}
                {authUser?.nativeLanguage && (
                  <span className="badge badge-secondary">
                    {getLanguageFlag(authUser.nativeLanguage)}
                    Native: {capitialize(authUser.nativeLanguage)}
                  </span>
                )}
                {authUser?.learningLanguage && (
                  <span className="badge badge-outline">
                    {getLanguageFlag(authUser.learningLanguage)}
                    Learning: {capitialize(authUser.learningLanguage)}
                  </span>
                )}
              </div>
            </div>
            {!isEditingProfile && (
              <button className="btn btn-outline btn-sm" onClick={handleEditProfile}>
                <PencilIcon className="size-4" />
                Edit Profile
              </button>
            )}
            {isEditingProfile && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditingProfile(false)}
                disabled={isSavingProfile}
              >
                Cancel
              </button>
            )}
          </div>
          {isEditingProfile && (
            <form
              onSubmit={handleProfileSubmit}
              className="px-6 pb-6 border-t border-base-300 pt-5"
            >
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
                  <div className="avatar size-24 shrink-0 rounded-full bg-base-300 overflow-hidden">
                    {profileForm.profilePic && (
                      <img src={profileForm.profilePic} alt="Profile preview" />
                    )}
                  </div>
                  <div className="form-control w-full">
                    <span className="label-text mb-2">Profile picture</span>
                    <div className="flex flex-wrap gap-2">
                      <label className="btn btn-outline btn-sm">
                        <UploadIcon className="size-4 mr-2" />
                        Upload image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={handleRandomAvatar}
                      >
                        <ShuffleIcon className="size-4 mr-2" />
                        Generate random avatar
                      </button>
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      JPG, PNG, or WebP. Images are resized before saving.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="form-control">
                    <span className="label-text mb-2">Full name</span>
                    <input
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      className="input input-bordered"
                      required
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2">Location</span>
                    <input
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      className="input input-bordered"
                      required
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2">Native language</span>
                    <select
                      name="nativeLanguage"
                      value={profileForm.nativeLanguage}
                      onChange={handleProfileChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select your native language</option>
                      {LANGUAGES.map((language) => (
                        <option key={`native-${language}`} value={language.toLowerCase()}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2">Learning language</span>
                    <select
                      name="learningLanguage"
                      value={profileForm.learningLanguage}
                      onChange={handleProfileChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Select a language to learn</option>
                      {LANGUAGES.map((language) => (
                        <option key={`learning-${language}`} value={language.toLowerCase()}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control md:col-span-2">
                    <span className="label-text mb-2">Bio</span>
                    <textarea
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      className="textarea textarea-bordered"
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary mt-5"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <LoaderIcon className="size-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
            </form>
          )}
        </section>

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Friends</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
