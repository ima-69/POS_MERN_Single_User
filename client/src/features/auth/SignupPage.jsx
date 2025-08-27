import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignupMutation } from "./authApi";
import logo from "../../assets/logo.png";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [signup, { isLoading, error }] = useSignupMutation();
  const navigate = useNavigate();
  
  // Create refs for each input field
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const submitRef = useRef(null);

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Handle Enter key press to move to next field
  function handleKeyPress(e, nextRef) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return alert("Passwords do not match");
    try {
      const result = await signup({
        username: form.username,
        password: form.password,
      }).unwrap();
      // Store token in localStorage as fallback for Vercel deployment
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      navigate("/login");
    } catch (e) {
      /* show below */
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 md:min-h-[600px]">
            {/* Left Panel - Branding */}
            <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 text-center">
                <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-8 mx-auto shadow-2xl">
                  <div className="w-40 h-40 rounded-full bg-white/30 flex items-center justify-center">
                    <img
                      src={logo}
                      alt="Prasanna Printers & Communication"
                      className="w-40 h-40"
                    />
                  </div>
                </div>
                <h1 className="text-2xl font-bold leading-tight mb-2">
                  PRASANNA PRINTERS
                </h1>
                <h2 className="text-lg opacity-90 mb-6">& COMMUNICATION</h2>
                <p className="text-sm opacity-80 max-w-xs mx-auto leading-relaxed">
                  All rights reserved. Designed and Developed by Zynaptrix.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-6 right-6 w-24 h-24 border border-white/20 rounded-full"></div>
              <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/20 rounded-full"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Create Account
                  </h3>
                  <p className="text-gray-300">Join our platform today</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">
                      Username
                    </label>
                    <input
                      ref={usernameRef}
                      name="username"
                      value={form.username}
                      onChange={onChange}
                      onKeyPress={(e) => handleKeyPress(e, passwordRef)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">
                      Password
                    </label>
                    <input
                      ref={passwordRef}
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={onChange}
                      onKeyPress={(e) => handleKeyPress(e, confirmRef)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">
                      Confirm Password
                    </label>
                    <input
                      ref={confirmRef}
                      name="confirm"
                      type="password"
                      value={form.confirm}
                      onChange={onChange}
                      onKeyPress={(e) => handleKeyPress(e, submitRef)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm backdrop-blur-sm">
                      {error.data?.message || "Signup failed"}
                    </div>
                  )}

                  <button
                    ref={submitRef}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-300 text-sm">
                      Already have an account?{" "}
                      <Link
                        className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
                        to="/login"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="p-8 text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 mx-auto">
                <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Prasanna Printers & Communication"
                    className="w-12 h-12"
                  />
                </div>
              </div>
              <h1 className="text-xl font-bold mb-1">PRASANNA PRINTERS</h1>
              <h2 className="text-base opacity-90">& COMMUNICATION</h2>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Create Account
                </h3>
                <p className="text-gray-300">Join our platform today</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Username
                  </label>
                  <input
                    ref={usernameRef}
                    name="username"
                    value={form.username}
                    onChange={onChange}
                    onKeyPress={(e) => handleKeyPress(e, passwordRef)}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-lg"
                    placeholder="Enter your username"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Password
                  </label>
                  <input
                    ref={passwordRef}
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={onChange}
                    onKeyPress={(e) => handleKeyPress(e, confirmRef)}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-lg"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Confirm Password
                  </label>
                  <input
                    ref={confirmRef}
                    name="confirm"
                    type="password"
                    value={form.confirm}
                    onChange={onChange}
                    onKeyPress={(e) => handleKeyPress(e, submitRef)}
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-lg"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200 text-sm backdrop-blur-sm">
                    {error.data?.message || "Signup failed"}
                  </div>
                )}

                <button
                  ref={submitRef}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-4 rounded-xl font-medium text-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98] shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center">
                  <p className="text-gray-300 text-base">
                    Already have an account?{" "}
                    <Link
                      className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
                      to="/login"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}