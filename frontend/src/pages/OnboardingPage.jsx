import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LoaderIcon,
  LogOutIcon,
  MapPinIcon,
  PaletteIcon,
  ShieldCheckIcon,
  ShuffleIcon,
  ShipWheelIcon,
  UploadIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import {
  changePassword,
  completeOnboarding,
  logout,
  submitFeedback,
  updateProfilePrivacy,
} from "../lib/api";
import { LANGUAGES, THEMES } from "../constants";
import { processProfileImage } from "../lib/profileImage";
import { useThemeStore } from "../store/useThemeStore";
import useAuthUser from "../hooks/useAuthUser";

const initialFormState = (user) => ({
  fullName: user?.fullName || "",
  bio: user?.bio || "",
  nativeLanguage: user?.nativeLanguage || "",
  learningLanguage: user?.learningLanguage || "",
  location: user?.location || "",
  profilePic: user?.profilePic || "",
});

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useThemeStore();
  const [formState, setFormState] = useState(() => initialFormState(authUser));
  const [activePanel, setActivePanel] = useState("overview");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [feedbackForm, setFeedbackForm] = useState({ category: "question", message: "" });

  const completedFields = useMemo(
    () =>
      [
        formState.fullName.trim(),
        formState.bio.trim(),
        formState.nativeLanguage,
        formState.learningLanguage,
        formState.location.trim(),
      ].filter(Boolean).length,
    [formState]
  );
  const progress = Math.round((completedFields / 5) * 100);

  const onboardingMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["authUser"], (current) => ({ ...current, user }));
      toast.success("Your profile is ready. Welcome to Streamify!");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to save your profile");
    },
  });

  const privacyMutation = useMutation({
    mutationFn: updateProfilePrivacy,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["authUser"], (current) => ({ ...current, user }));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(user.isProfilePublic ? "Your profile is discoverable" : "Your profile is hidden");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to update privacy settings");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      changePassword({ currentPassword, newPassword }),
    onSuccess: ({ message }) => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(message || "Password updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to change your password");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: ({ message }) => {
      setFeedbackForm({ category: "question", message: "" });
      toast.success(message || "Thanks for your feedback");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to send feedback");
    },
  });

  const switchAccountMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({ queryKey: ["streamToken"] });
      toast.success("You have been signed out");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to switch accounts");
    },
  });

  const updateFormField = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const profilePic = await processProfileImage(file);
      setFormState((current) => ({ ...current, profilePic }));
      toast.success("Profile photo added. Save your profile to keep it.");
    } catch (error) {
      toast.error(error.message || "Unable to process this image");
    }
  };

  const handleRandomAvatar = () => {
    const avatarNumber = Math.floor(Math.random() * 100) + 1;
    setFormState((current) => ({
      ...current,
      profilePic: `https://avatar.iran.liara.run/public/${avatarNumber}.png`,
    }));
  };

  const handleSubmitProfile = (event) => {
    event.preventDefault();
    onboardingMutation.mutate({
      ...formState,
      fullName: formState.fullName.trim(),
      bio: formState.bio.trim(),
      location: formState.location.trim(),
    });
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Your new passwords do not match");
      return;
    }
    passwordMutation.mutate(passwordForm);
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    feedbackMutation.mutate(feedbackForm);
  };

  const profileSections = [
    { id: "overview", label: "Your profile", icon: UserRoundIcon },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheckIcon },
    { id: "settings", label: "Settings", icon: PaletteIcon },
    { id: "help", label: "Help & Feedback", icon: CircleHelpIcon },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <header className="border-b border-base-300 bg-base-200/70">
        <div className="navbar container mx-auto min-h-16 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Streamify home">
            <ShipWheelIcon className="size-8 text-primary" />
            <span className="text-2xl font-bold font-mono tracking-wider">Streamify</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm opacity-70 sm:inline">
              Setting up your account
            </span>
            <div className="avatar">
              <div className="size-9 rounded-full bg-base-300">
                {authUser?.profilePic ? (
                  <img src={authUser.profilePic} alt="" />
                ) : (
                  <UserRoundIcon className="m-auto size-5" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 max-w-2xl">
          <div className="badge badge-primary badge-outline mb-3">ONE LAST STEP</div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete your profile</h1>
          <p className="mt-3 text-base-content/70">
            Add a few details so language partners can get to know you and make the right
            connections.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body gap-6 p-5 sm:p-8">
              <div className="flex flex-col gap-5 border-b border-base-300 pb-6 sm:flex-row sm:items-center">
                <div className="avatar">
                  <div className="size-28 overflow-hidden rounded-full bg-base-300 ring ring-primary ring-offset-4 ring-offset-base-200">
                    {formState.profilePic ? (
                      <img src={formState.profilePic} alt="Profile photo preview" />
                    ) : (
                      <CameraIcon className="m-auto size-10 text-base-content/40" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Your profile photo</h2>
                  <p className="mt-1 text-sm text-base-content/65">
                    Choose a clear photo so your new friends recognize you.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="size-4" />
                      Upload photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleRandomAvatar}
                    >
                      <ShuffleIcon className="size-4" />
                      Use an avatar
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-base-content/55">
                    JPG, PNG, or WebP up to 10 MB. Images are resized before saving.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text mb-2 font-medium">Full name</span>
                    <input
                      name="fullName"
                      value={formState.fullName}
                      onChange={updateFormField}
                      className="input input-bordered w-full"
                      placeholder="How should we call you?"
                      autoComplete="name"
                      maxLength={80}
                      required
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2 font-medium">Location</span>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-base-content/50" />
                      <input
                        name="location"
                        value={formState.location}
                        onChange={updateFormField}
                        className="input input-bordered w-full pl-10"
                        placeholder="City, Country"
                        autoComplete="address-level2"
                        maxLength={100}
                        required
                      />
                    </div>
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2 font-medium">Native language</span>
                    <select
                      name="nativeLanguage"
                      value={formState.nativeLanguage}
                      onChange={updateFormField}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Choose your native language</option>
                      {LANGUAGES.map((language) => (
                        <option key={`native-${language}`} value={language.toLowerCase()}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-2 font-medium">Language you’re learning</span>
                    <select
                      name="learningLanguage"
                      value={formState.learningLanguage}
                      onChange={updateFormField}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Choose a language to learn</option>
                      {LANGUAGES.map((language) => (
                        <option key={`learning-${language}`} value={language.toLowerCase()}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text mb-2 font-medium">A little about you</span>
                  <textarea
                    name="bio"
                    value={formState.bio}
                    onChange={updateFormField}
                    className="textarea textarea-bordered min-h-28"
                    placeholder="Share what brings you here and what you enjoy talking about."
                    maxLength={500}
                    required
                  />
                  <span className="label-text-alt mt-1 self-end text-base-content/55">
                    {formState.bio.length}/500
                  </span>
                </label>

                <div className="rounded-xl bg-base-100 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Profile completion</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={progress}
                    max="100"
                    aria-label={`Profile ${progress}% complete`}
                  />
                  <p className="mt-2 text-xs text-base-content/60">
                    Complete all required details to start meeting language partners.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={onboardingMutation.isPending}
                >
                  {onboardingMutation.isPending ? (
                    <>
                      <LoaderIcon className="size-4 animate-spin" />
                      Saving your profile…
                    </>
                  ) : (
                    <>
                      Finish profile
                      <ArrowRightIcon className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <h2 className="px-2 pb-2 text-sm font-semibold uppercase tracking-wide text-base-content/55">
                  Account
                </h2>
                <nav className="space-y-1" aria-label="Account options">
                  {profileSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActivePanel(section.id)}
                      className={`btn btn-ghost w-full justify-start gap-3 normal-case ${
                        activePanel === section.id ? "bg-primary/10 text-primary" : ""
                      }`}
                      aria-current={activePanel === section.id ? "page" : undefined}
                    >
                      <section.icon className="size-4" />
                      {section.label}
                      <ChevronRightIcon className="ml-auto size-4 opacity-50" />
                    </button>
                  ))}
                </nav>
                <div className="divider my-2" />
                <button
                  type="button"
                  onClick={() => setActivePanel("switch-account")}
                  className={`btn btn-ghost w-full justify-start gap-3 normal-case ${
                    activePanel === "switch-account" ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <UsersIcon className="size-4" />
                  Switch account
                  <ChevronRightIcon className="ml-auto size-4 opacity-50" />
                </button>
              </div>
            </section>

            <section className="card border border-primary/15 bg-primary/5">
              <div className="card-body p-5">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckIcon className="size-5" />
                </div>
                <h2 className="mt-1 font-semibold">Your next conversation is waiting</h2>
                <p className="text-sm text-base-content/65">
                  A complete profile helps other learners find the right conversation partner.
                </p>
              </div>
            </section>

            <section className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body gap-1 p-5">
                {activePanel === "overview" && (
                  <>
                    <h2 className="font-semibold">Profile setup</h2>
                    <p className="text-sm text-base-content/65">
                      Your profile helps people connect with you for language practice. You can
                      update it later from your account.
                    </p>
                  </>
                )}

                {activePanel === "privacy" && (
                  <>
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="size-5 text-primary" />
                      <h2 className="font-semibold">Privacy & Security</h2>
                    </div>
                    <p className="text-sm text-base-content/65">
                      Control profile discovery and keep your sign-in secure.
                    </p>
                    <label className="mt-3 flex cursor-pointer items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-medium">Show me to new learners</span>
                        <span className="block text-xs text-base-content/60">
                          When hidden, you won’t appear in recommendations.
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={authUser?.isProfilePublic !== false}
                        onChange={(event) => privacyMutation.mutate(event.target.checked)}
                        disabled={privacyMutation.isPending}
                        aria-label="Show my profile in recommendations"
                      />
                    </label>
                    <div className="divider my-2" />
                    <h3 className="font-medium">Change password</h3>
                    <form onSubmit={handlePasswordSubmit} className="mt-2 space-y-3">
                      <label className="form-control">
                        <span className="label-text mb-1 text-xs">Current password</span>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                currentPassword: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full pr-10"
                            autoComplete="current-password"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowCurrentPassword((shown) => !shown)}
                            aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                          >
                            {showCurrentPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1 text-xs">New password</span>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                newPassword: event.target.value,
                              }))
                            }
                            className="input input-bordered input-sm w-full pr-10"
                            autoComplete="new-password"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => setShowNewPassword((shown) => !shown)}
                            aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                          >
                            {showNewPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                          </button>
                        </div>
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1 text-xs">Confirm new password</span>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              confirmPassword: event.target.value,
                            }))
                          }
                          className="input input-bordered input-sm w-full"
                          autoComplete="new-password"
                          minLength={6}
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm w-full"
                        disabled={passwordMutation.isPending}
                      >
                        {passwordMutation.isPending ? (
                          <LoaderIcon className="size-4 animate-spin" />
                        ) : (
                          <KeyRoundIcon className="size-4" />
                        )}
                        Update password
                      </button>
                    </form>
                  </>
                )}

                {activePanel === "settings" && (
                  <>
                    <div className="flex items-center gap-2">
                      <PaletteIcon className="size-5 text-primary" />
                      <h2 className="font-semibold">Settings</h2>
                    </div>
                    <p className="text-sm text-base-content/65">
                      Personalize how Streamify looks on this device.
                    </p>
                    <label className="form-control mt-3">
                      <span className="label-text mb-2 text-sm font-medium">Color theme</span>
                      <select
                        className="select select-bordered select-sm w-full"
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                      >
                        {THEMES.map((themeOption) => (
                          <option key={themeOption.name} value={themeOption.name}>
                            {themeOption.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-base-content/55">
                      Your theme is saved automatically on this device.
                    </p>
                  </>
                )}

                {activePanel === "switch-account" && (
                  <>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="size-5 text-primary" />
                      <h2 className="font-semibold">Switch account</h2>
                    </div>
                    <p className="text-sm text-base-content/65">
                      Sign out of {authUser?.email || "this account"} and continue with another
                      account.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchAccountMutation.mutate()}
                      className="btn btn-outline btn-sm mt-3 w-full"
                      disabled={switchAccountMutation.isPending}
                    >
                      {switchAccountMutation.isPending ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        <LogOutIcon className="size-4" />
                      )}
                      Sign out and switch
                    </button>
                  </>
                )}

                {activePanel === "help" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CircleHelpIcon className="size-5 text-primary" />
                      <h2 className="font-semibold">Help & Feedback</h2>
                    </div>
                    <p className="text-sm text-base-content/65">
                      Ask a question, report a problem, or suggest an improvement.
                    </p>
                    <form onSubmit={handleFeedbackSubmit} className="mt-3 space-y-3">
                      <label className="form-control">
                        <span className="label-text mb-1 text-xs">What can we help with?</span>
                        <select
                          className="select select-bordered select-sm w-full"
                          value={feedbackForm.category}
                          onChange={(event) =>
                            setFeedbackForm((current) => ({
                              ...current,
                              category: event.target.value,
                            }))
                          }
                        >
                          <option value="question">Question</option>
                          <option value="bug">Report a problem</option>
                          <option value="suggestion">Suggestion</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-1 text-xs">Your message</span>
                        <textarea
                          className="textarea textarea-bordered min-h-28 text-sm"
                          placeholder="Tell us how we can help (10–2000 characters)"
                          value={feedbackForm.message}
                          onChange={(event) =>
                            setFeedbackForm((current) => ({
                              ...current,
                              message: event.target.value,
                            }))
                          }
                          minLength={10}
                          maxLength={2000}
                          required
                        />
                        <span className="label-text-alt mt-1 self-end">
                          {feedbackForm.message.length}/2000
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm w-full"
                        disabled={feedbackMutation.isPending}
                      >
                        {feedbackMutation.isPending ? (
                          <LoaderIcon className="size-4 animate-spin" />
                        ) : (
                          <ArrowRightIcon className="size-4" />
                        )}
                        Send feedback
                      </button>
                    </form>
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
