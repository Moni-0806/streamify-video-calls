import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LoaderIcon,
  LogOutIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { changePassword, logout, submitFeedback, updateProfilePrivacy } from "../lib/api";

const SECTIONS = [
  {
    id: "settings",
    label: "Settings",
    description: "Personalize Streamify on this device.",
    icon: PaletteIcon,
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    description: "Manage profile visibility and protect your account.",
    icon: ShieldCheckIcon,
  },
  {
    id: "switch-account",
    label: "Switch Account",
    description: "Sign out before continuing with another account.",
    icon: UsersIcon,
  },
  {
    id: "help",
    label: "Help & Feedback",
    description: "Send a question, report a problem, or share an idea.",
    icon: CircleHelpIcon,
  },
];

const SettingsPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const { theme, setTheme } = useThemeStore();
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
  const [feedback, setFeedback] = useState({ category: "question", message: "" });

  const activeSection = SECTIONS.find((item) => item.id === section);

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
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(message || "Password updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to change your password");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: ({ message }) => {
      setFeedback({ category: "question", message: "" });
      toast.success(message || "Thanks for your feedback");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to send feedback");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.removeQueries({ queryKey: ["streamToken"] });
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Unable to sign out");
    },
  });

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast.error("Your new passwords do not match");
      return;
    }
    passwordMutation.mutate(password);
  };

  if (!activeSection) return <Navigate to="/settings/settings" replace />;

  const ActiveIcon = activeSection.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <Link to="/" className="btn btn-ghost btn-sm mb-5 -ml-2">
          <ArrowLeftIcon className="size-4" />
          Back to Home
        </Link>

        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Account center
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Account & preferences</h1>
          <p className="mt-2 max-w-2xl text-base-content/65">
            Manage your experience, privacy, and account security in one place.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav
            className="card border border-base-300 bg-base-200 p-2 shadow-sm"
            aria-label="Account settings"
          >
            {SECTIONS.map((item) => (
              <Link
                key={item.id}
                to={`/settings/${item.id}`}
                aria-current={section === item.id ? "page" : undefined}
                className={`btn btn-ghost justify-start gap-3 normal-case ${
                  section === item.id ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body p-5 sm:p-8">
              <div className="mb-6 flex items-start gap-4 border-b border-base-300 pb-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ActiveIcon className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{activeSection.label}</h2>
                  <p className="mt-1 text-sm text-base-content/65">
                    {activeSection.description}
                  </p>
                </div>
              </div>

              {section === "settings" && (
                <div className="max-w-xl space-y-5">
                  <label className="form-control">
                    <span className="label-text mb-2 font-medium">Color theme</span>
                    <select
                      className="select select-bordered w-full max-w-sm"
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
                  <p className="text-sm text-base-content/60">
                    Your theme is saved automatically on this device.
                  </p>
                  <div className="rounded-xl bg-base-100 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2Icon className="size-5 text-success" />
                      <div>
                        <p className="font-medium">You’re all set</p>
                        <p className="text-sm text-base-content/60">
                          Profile details can be edited from your Home page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "privacy" && (
                <div className="max-w-xl space-y-7">
                  <div className="flex flex-col justify-between gap-4 rounded-xl bg-base-100 p-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-medium">Show my profile to new learners</h3>
                      <p className="mt-1 text-sm text-base-content/60">
                        When hidden, you won’t appear in recommendations. Existing friends can
                        still chat with you.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={authUser?.isProfilePublic !== false}
                      onChange={(event) => privacyMutation.mutate(event.target.checked)}
                      disabled={privacyMutation.isPending}
                      aria-label="Show my profile in recommendations"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold">Change password</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      Confirm your current password before choosing a new one.
                    </p>
                    <form onSubmit={handlePasswordSubmit} className="mt-4 max-w-md space-y-4">
                      <label className="form-control">
                        <span className="label-text mb-2">Current password</span>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            className="input input-bordered w-full pr-12"
                            value={password.currentPassword}
                            onChange={(event) =>
                              setPassword((current) => ({
                                ...current,
                                currentPassword: event.target.value,
                              }))
                            }
                            autoComplete="current-password"
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setShowPasswords((current) => ({
                                ...current,
                                current: !current.current,
                              }))
                            }
                            aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
                          >
                            {showPasswords.current ? (
                              <EyeOffIcon className="size-4" />
                            ) : (
                              <EyeIcon className="size-4" />
                            )}
                          </button>
                        </div>
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-2">New password</span>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            className="input input-bordered w-full pr-12"
                            value={password.newPassword}
                            onChange={(event) =>
                              setPassword((current) => ({
                                ...current,
                                newPassword: event.target.value,
                              }))
                            }
                            autoComplete="new-password"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              setShowPasswords((current) => ({
                                ...current,
                                new: !current.new,
                              }))
                            }
                            aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
                          >
                            {showPasswords.new ? (
                              <EyeOffIcon className="size-4" />
                            ) : (
                              <EyeIcon className="size-4" />
                            )}
                          </button>
                        </div>
                      </label>
                      <label className="form-control">
                        <span className="label-text mb-2">Confirm new password</span>
                        <input
                          type="password"
                          className="input input-bordered w-full"
                          value={password.confirmPassword}
                          onChange={(event) =>
                            setPassword((current) => ({
                              ...current,
                              confirmPassword: event.target.value,
                            }))
                          }
                          autoComplete="new-password"
                          minLength={6}
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        className="btn btn-primary"
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
                  </div>
                </div>
              )}

              {section === "switch-account" && (
                <div className="max-w-xl">
                  <div className="rounded-xl bg-base-100 p-5">
                    <div className="flex items-center gap-4">
                      <div className="avatar">
                        <div className="size-14 rounded-full">
                          {authUser?.profilePic && (
                            <img src={authUser.profilePic} alt={authUser.fullName} />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{authUser?.fullName}</p>
                        <p className="truncate text-sm text-base-content/60">{authUser?.email}</p>
                      </div>
                    </div>
                    <div className="divider" />
                    <p className="text-sm text-base-content/65">
                      Sign out of this account to use a different Streamify account on this device.
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline btn-error mt-4"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        <LogOutIcon className="size-4" />
                      )}
                      Sign out and switch
                    </button>
                  </div>
                </div>
              )}

              {section === "help" && (
                <div className="max-w-xl">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      feedbackMutation.mutate(feedback);
                    }}
                    className="space-y-4"
                  >
                    <label className="form-control">
                      <span className="label-text mb-2 font-medium">Feedback type</span>
                      <select
                        className="select select-bordered"
                        value={feedback.category}
                        onChange={(event) =>
                          setFeedback((current) => ({
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
                      <span className="label-text mb-2 font-medium">How can we help?</span>
                      <textarea
                        className="textarea textarea-bordered min-h-36"
                        placeholder="Describe your question, issue, or idea (10–2000 characters)."
                        minLength={10}
                        maxLength={2000}
                        value={feedback.message}
                        onChange={(event) =>
                          setFeedback((current) => ({
                            ...current,
                            message: event.target.value,
                          }))
                        }
                        required
                      />
                      <span className="label-text-alt mt-1 self-end">
                        {feedback.message.length}/2000
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={feedbackMutation.isPending}
                    >
                      {feedbackMutation.isPending ? (
                        <LoaderIcon className="size-4 animate-spin" />
                      ) : (
                        <CircleHelpIcon className="size-4" />
                      )}
                      Send feedback
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
