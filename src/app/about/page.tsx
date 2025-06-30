import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-blue-600">About Us</h1>
        <p className="text-gray-700 leading-relaxed text-lg">
          We are passionate developers building beautiful and performant web experiences.
          This site is a demo showing how you can structure a public site with modern UI, no login required.
        </p>
      </section>
    </main>
  )
}
