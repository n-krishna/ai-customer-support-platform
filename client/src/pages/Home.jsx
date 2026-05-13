import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
            AI
          </div>

          <h1 className="text-2xl font-bold">SupportAI</h1>
        </div>

        <div className="hidden md:flex items-center gap-8 text-slate-300">
          <a href="#features" className="hover:text-white">
            Features
          </a>

          <a href="#how-it-works" className="hover:text-white">
            How It Works
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-20 md:py-28 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-blue-400 font-semibold mb-4">
            AI-Powered Customer Support Platform
          </p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Automate Support, Resolve Tickets Faster, and Improve Customer
            Experience
          </h2>

          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10">
            SupportAI helps businesses answer customer questions instantly using
            AI, create support tickets automatically, and manage customer issues
            from a powerful admin dashboard.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/chatbot"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold"
            >
              Try Demo Chatbot
            </Link>

            <Link
              to="/admin"
              className="border border-slate-600 hover:bg-slate-800 px-8 py-4 rounded-xl font-semibold"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Chat Preview */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-slate-800 px-6 py-4 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>

            <p className="ml-4 text-slate-300">
              Live Support Chat Preview
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex">
              <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl max-w-md">
                Hi! I’m SupportAI. How can I help you today?
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-blue-600 text-white p-4 rounded-2xl max-w-md">
                I forgot my password. How can I reset it?
              </div>
            </div>

            <div className="flex">
              <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl max-w-md">
                You can reset your password by clicking “Forgot Password” on
                the login page. I can also create a support ticket if you still
                need help.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Modern Support Teams
            </h3>

            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything needed to automate customer support and manage tickets
              efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">🤖</div>

              <h4 className="text-xl font-bold mb-3">AI Chatbot</h4>

              <p className="text-slate-400">
                Automatically answers common customer questions using AI-powered
                responses.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">🎫</div>

              <h4 className="text-xl font-bold mb-3">Ticket Management</h4>

              <p className="text-slate-400">
                Create, track, prioritize, and resolve customer support tickets
                from one dashboard.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">📊</div>

              <h4 className="text-xl font-bold mb-3">Admin Analytics</h4>

              <p className="text-slate-400">
                Monitor ticket volume, AI resolution rate, open issues, and
                support performance.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">🔐</div>

              <h4 className="text-xl font-bold mb-3">Secure Login</h4>

              <p className="text-slate-400">
                Supports user authentication and role-based access for customers
                and admins.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">⚡</div>

              <h4 className="text-xl font-bold mb-3">Fast Responses</h4>

              <p className="text-slate-400">
                Reduce customer wait times by giving instant answers to common
                issues.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
              <div className="text-4xl mb-5">🧠</div>

              <h4 className="text-xl font-bold mb-3">Context Memory</h4>

              <p className="text-slate-400">
                Keeps track of conversation history to provide better and more
                relevant replies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              How SupportAI Works
            </h3>

            <p className="text-slate-400">
              A simple workflow designed for real customer support teams.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>

              <h4 className="font-bold mb-2">Customer Asks</h4>

              <p className="text-slate-400">
                User sends a question through the chatbot.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>

              <h4 className="font-bold mb-2">AI Responds</h4>

              <p className="text-slate-400">
                AI searches FAQs and responds instantly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>

              <h4 className="font-bold mb-2">Ticket Created</h4>

              <p className="text-slate-400">
                Complex issues are converted into support tickets.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>

              <h4 className="font-bold mb-2">Admin Resolves</h4>

              <p className="text-slate-400">
                Support team manages tickets from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold">70%</h3>
            <p className="text-blue-100 mt-2">Faster Responses</p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">24/7</h3>
            <p className="text-blue-100 mt-2">AI Availability</p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">40%</h3>
            <p className="text-blue-100 mt-2">Reduced Ticket Load</p>
          </div>

          <div>
            <h3 className="text-4xl font-bold">100%</h3>
            <p className="text-blue-100 mt-2">Trackable Support</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Automate Your Customer Support?
          </h3>

          <p className="text-slate-400 text-lg mb-8">
            Start using SupportAI to answer questions faster, reduce manual
            tickets, and improve customer satisfaction.
          </p>

          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-slate-800 text-center text-slate-400">
        <p>
          © 2026 SupportAI. Built as a full-stack software developer project.
        </p>
      </footer>
    </div>
  );
}

export default Home;