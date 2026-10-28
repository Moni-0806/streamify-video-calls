import { useState } from "react";
import { EyeIcon, EyeOffIcon, ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";

import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: signupMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    signupMutation(signupData);
  };

  return (
    <div
      className="flex min-h-screen min-h-[100svh] items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="my-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-primary/25 bg-base-100 shadow-lg lg:flex-row">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="flex w-full flex-col p-5 sm:p-8 lg:w-1/2">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-8 text-primary sm:size-9" />
            <span className="text-2xl font-bold font-mono tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary sm:text-3xl">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nimona Dida"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="nimona@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="********"
                        className="input input-bordered w-full pr-10"
                        value={signupData.password}
                        onChange={(e) => {
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          });
                          if (e.target.value === confirmPassword)
                            setPasswordMismatch(false);
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setIsPasswordVisible((visible) => !visible)
                        }
                        aria-label={
                          isPasswordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isPasswordVisible}
                      >
                        {isPasswordVisible ? (
                          <EyeOffIcon className="size-4" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  {/* CONFIRM PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Confirm Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        placeholder="********"
                        className="input input-bordered w-full pr-10"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (e.target.value === signupData.password)
                            setPasswordMismatch(false);
                        }}
                        aria-invalid={passwordMismatch}
                        aria-describedby={
                          passwordMismatch
                            ? "password-mismatch-error"
                            : undefined
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setIsConfirmPasswordVisible((visible) => !visible)
                        }
                        aria-label={
                          isConfirmPasswordVisible
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        aria-pressed={isConfirmPasswordVisible}
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOffIcon className="size-4" aria-hidden="true" />
                        ) : (
                          <EyeIcon className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p
                        id="password-mismatch-error"
                        className="text-xs text-error mt-1"
                        role="alert"
                      >
                        Passwords do not match.
                      </p>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        required
                      />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">
                          terms of service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline">
                          privacy policy
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-6 lg:p-8">
            {/* Illustration */}
            <div className="relative mx-auto aspect-square max-w-xs xl:max-w-sm">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
