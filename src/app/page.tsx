import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-4">Welcome to MyWebsite</h1>
        <p className="text-lg text-gray-700 mb-6 max-w-xl">
          Discover content, learn more about us, or read our latest blogs.
        </p>
        <div className="flex gap-4">
          <a href="/register" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Get Started</a>
          <a href="/blog" className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">Explore Blog</a>
        </div>
      </section>
    </main>
  )
}
