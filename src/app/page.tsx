import Link from "next/link";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-b-to-r from-red-50 via-white to-red-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Open Todoist
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Bulk Add Tasks to <span className="text-red-500">Todoist</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform any text into organized Todoist tasks with AI. Perfect for
            semester planning, project management, or any situation where you
            need to add multiple tasks quickly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Adding Tasks
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              How It Works
            </a>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Paste Your Text
              </h3>
              <p className="text-gray-600">
                Copy and paste any text containing tasks, todos, or planning
                information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. AI Processing
              </h3>
              <p className="text-gray-600">
                Our AI analyzes your text and extracts all tasks, setting
                priorities and due dates automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Review & Add
              </h3>
              <p className="text-gray-600">
                Review the extracted tasks, make any adjustments, and add them
                to your Todoist with one click.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mx-4">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Open Todoist?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Smart Task Extraction
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI understands context and creates meaningful tasks from any
                    text source.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">📅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Automatic Due Dates
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Detects dates and deadlines in your text and sets them
                    appropriately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <span className="text-purple-600 font-bold">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Priority Detection
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Automatically assigns appropriate priorities based on
                    urgency and importance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <span className="text-orange-600 font-bold">⚡</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Bulk Operations
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Add multiple tasks at once with approve-all functionality
                    for efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Supercharge Your Todoist?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who save hours by automating their task
            creation process.
          </p>
          <Link
            href="/dashboard"
            className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 rounded-lg font-semibold text-xl transition-colors shadow-lg hover:shadow-xl inline-block"
          >
            Get Started Now - It&apos;s Free!
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">✓</span>
            </div>
            <span className="font-semibold text-gray-900">Open Todoist</span>
          </div>
          <p className="text-gray-600 text-sm">
            Transform your productivity with AI-powered task management.
          </p>
        </div>
      </footer>
    </div>
  );
}
