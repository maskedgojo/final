import Navbar from '@/components/Navbar'

export default function BlogPage() {
  return (
    <main>
      <Navbar />
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 text-blue-600">Latest Blog Posts</h1>
        <ul className="space-y-6">
          <li>
            <h2 className="text-2xl font-semibold">🚀 Launching Our New Platform</h2>
            <p className="text-gray-600">June 25, 2025 · 2 min read</p>
            <p className="mt-2 text-gray-700">We are excited to introduce our brand-new platform designed for performance and usability...</p>
          </li>
          <li>
            <h2 className="text-2xl font-semibold">💡 Tips to Improve Your Frontend</h2>
            <p className="text-gray-600">June 18, 2025 · 4 min read</p>
            <p className="mt-2 text-gray-700">Want to make your web pages stand out? Here is a quick guide to modern UI design best practices...</p>
          </li>
        </ul>
      </section>
    </main>
  )
}
