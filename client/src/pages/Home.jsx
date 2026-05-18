import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
              AI
            </div>

            <span className="text-2xl font-bold tracking-tight">
              SupportAI
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>

            <Link to="/admin-login" className="hover:text-white transition">
              Admin Portal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex border border-slate-700 hover:border-blue-500 hover:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Customer Login
            </Link>

            <Link
              to="/admin-login"
              className="hidden md:inline-flex border border-slate-700 hover:border-blue-500 hover:bg-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Admin Login
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

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
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
            >
              Customer Registration
            </Link>

            <Link
              to="/admin-register"
              className="border border-slate-600 hover:border-blue-500 hover:bg-slate-900 px-8 py-4 rounded-xl font-semibold transition"
            >
              Admin Registration
            </Link>
          </div>
        </div>
      </section>

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
            {[
              ["🤖", "AI Chatbot", "Automatically answers common customer questions using AI-powered responses."],
              ["🎫", "Ticket Management", "Create, track, prioritize, and resolve customer support tickets from one dashboard."],
              ["📊", "Admin Analytics", "Monitor ticket volume, AI resolution rate, open issues, and support performance."],
              ["🔐", "Secure Login", "Supports user authentication and role-based access for customers and admins."],
              ["⚡", "Fast Responses", "Reduce customer wait times by giving instant answers to common issues."],
              ["🧠", "Context Memory", "Keeps track of conversation history to provide better and more relevant replies."],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition"
              >
                <div className="text-4xl mb-5">{icon}</div>

                <h4 className="text-xl font-bold mb-3">{title}</h4>

                <p className="text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            {[
              ["1", "Customer Asks", "User sends a question through the chatbot."],
              ["2", "AI Responds", "AI searches FAQs and responds instantly."],
              ["3", "Ticket Created", "Complex issues are converted into support tickets."],
              ["4", "Admin Resolves", "Support team manages tickets from the dashboard."],
            ].map(([number, title, text]) => (
              <div key={number} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-4">
                  {number}
                </div>

                <h4 className="font-bold mb-2">{title}</h4>

                <p className="text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-20 bg-blue-600">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            ["70%", "Faster Responses"],
            ["24/7", "AI Availability"],
            ["40%", "Reduced Ticket Load"],
            ["100%", "Trackable Support"],
          ].map(([value, label]) => (
            <div key={label}>
              <h3 className="text-4xl font-bold">{value}</h3>
              <p className="text-blue-100 mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Automate Your Customer Support?
          </h3>

          <p className="text-slate-400 text-lg mb-8">
            Start using SupportAI to answer questions faster, reduce manual
            tickets, and improve customer satisfaction.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
            >
              Customer Registration
            </Link>

            <Link
              to="/admin-register"
              className="border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-xl font-semibold transition"
            >
              Admin Registration
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 border-t border-slate-800 text-center text-slate-400">
        <p>
          © 2026 SupportAI. Full-Stack AI Customer Support Platform built by
          Nithin Krishna.
        </p>
      </footer>
    </div>
  );
}

export default Home;