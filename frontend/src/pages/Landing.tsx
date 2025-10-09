import { Link } from 'react-router-dom';
import { Video, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              <span className="text-xl sm:text-2xl font-bold text-white">AI Companion</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/auth/login"
                className="px-3 py-2 sm:px-4 sm:py-2 text-white hover:text-blue-400 transition-colors text-sm sm:text-base"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/30 text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Powered by AI</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Meet Your AI
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Video Companion
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience natural conversations with AI companions through real-time video calls.
            Choose from experts in various fields and get personalized assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 sm:mb-20">
            <Link
              to="/auth/signup"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 text-base sm:text-lg active:scale-95"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/auth/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all border border-slate-700 text-base sm:text-lg active:scale-95"
            >
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Video className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Video Calls</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Connect face-to-face with AI companions through high-quality video streaming
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Real-time Chat</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Chat alongside video calls for a complete communication experience
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">AI Expertise</h3>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Choose from companions with specialized knowledge in various domains
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/50 mt-16 sm:mt-24">
        <div className="container mx-auto px-4 py-6 sm:py-8 text-center text-slate-400 text-sm">
          <p>&copy; 2025 AI Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
