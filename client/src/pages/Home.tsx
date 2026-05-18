  import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../layouts/ThemeToggleButton";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Full-Screen Background */}
      <img
        src="images/login.jpeg"
        alt="Enterprise background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30"></div>

      {/* Header Navigation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <img
            src="images/bull-logo-text.png"
            alt="Bull Machine Logo"
            className="h-8 w-auto dark:invert"
          />
        </div>
        <nav className="hidden md:flex items-center space-x-8">           
          <Link
            to="/login"
            className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
           Register
          </Link>
        </nav>
        <div className="md:hidden">
          <ThemeToggleButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="flex items-center justify-center min-h-screen px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center items-center mb-8 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              <img
                src="images/bull-logo-text.png"
                alt="Bull Machine Logo"
                className="h-12 w-auto dark:invert"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slideUp" style={{animationDelay: '0.5s'}}>
              Cost Rate
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Approval System
              </span>
              <span className="block text-3xl md:text-4xl mt-2 text-gray-200">
                Enterprise Financial Management
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-slideUp" style={{animationDelay: '0.7s'}}>
              Streamline your organization's cost approval workflows with intelligent automation,
              real-time tracking, and comprehensive analytics for enterprise-grade efficiency and cost control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-slideUp" style={{animationDelay: '0.9s'}}>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto border-2 border-white/30 hover:border-white/50 text-white font-bold py-3 px-6 rounded-xl backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 text-center"
              >
                Sign In
              </Link>
            </div>

           
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powerful Features for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  Cost Management
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to manage manufacturing costs efficiently with multi-level approvals, automated workflows, and real-time cost tracking.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Automated Approval Workflows</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Configure intelligent approval chains with role-based routing, automatic escalations, and conditional approvals based on cost thresholds and budget limits.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Cost Tracking</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Monitor budget utilization in real-time with comprehensive dashboards, cost center analysis, and predictive analytics for better financial planning.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Bank-level encryption, audit trails, and compliance standards ensure your financial data remains secure with role-based access control.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Advanced Reporting</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Generate detailed reports on cost trends, approval times, budget utilization, and compliance metrics with customizable dashboards and exports.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Notifications</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Stay informed with intelligent alerts for pending approvals, budget thresholds, and deadline reminders across email, SMS, and in-app notifications.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Platform Access</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Access your cost approval system from anywhere with our responsive web app, mobile-optimized interface, and API integrations.
                </p>
              </div>
            </div>
          </div>
        </section>        
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img
                src="images/bull-logo-text.png"
                alt="Bull Machine Logo"
                className="h-6 w-auto dark:invert"
              />
              <span className="text-gray-300 text-sm"> {new Date().getFullYear()} Bull Machine. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>          
        </div>
      </footer>
    </div>
  );
}
