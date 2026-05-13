function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-600">SupportAI</h1>

        <div className="space-x-4">
          <a href="/login" className="text-gray-700">
            Login
          </a>
          <a
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Sign Up
          </a>
        </div>
      </nav>

      <section className="text-center py-24 px-6">
        <h2 className="text-5xl font-bold mb-6">
          AI Customer Support Platform
        </h2>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Automate customer support with AI chatbot responses, ticket creation,
          and admin analytics.
        </p>

        <a
          href="/chatbot"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Try Demo Chat
        </a>
      </section>
    </div>
  );
}

export default Home;