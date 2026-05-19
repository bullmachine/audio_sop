  import { Link } from "react-router-dom";
import { ThemeToggleButton } from "../layouts/ThemeToggleButton";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Full-Screen Background */}
      <img
        src="images/login.jpeg"
        alt="Manufacturing operations background"
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
              Audio SOP
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Management System
              </span>
              <span className="block text-3xl md:text-4xl mt-2 text-gray-200">
                Manufacturing Operations Excellence
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-slideUp" style={{animationDelay: '0.7s'}}>
              Streamline your manufacturing operations with audio-based Standard Operating Procedures,
              operator assignments, and multi-language support for enhanced workplace efficiency and compliance.
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
                  Manufacturing Operations
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to manage audio SOPs, operator assignments, and multi-language support for enhanced workplace efficiency.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Audio SOP Management</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Upload, organize, and manage audio-based Standard Operating Procedures with drag-and-drop file ordering and multi-format support.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Operator Assignments</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Assign audio SOPs to specific operators based on products, stages, and languages with role-based access control.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Language Support</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Create and manage SOPs in multiple languages to support diverse workforce needs and ensure clear communication.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Role-Based Access</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Comprehensive access control with Super Admin and Operator roles, ensuring users only see and access their assigned content.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Audio Playback</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Built-in audio player with headset controls, playlist management, and seamless playback experience for operators.
                </p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Process Management</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Manage manufacturing stages, products (KMAT), and organize SOPs by process hierarchy for systematic operations.
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
