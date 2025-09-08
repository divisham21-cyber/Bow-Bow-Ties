import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">Welcome to Bow Bow Ties</h1>
          <p className="text-lg text-center text-gray-600 mb-8">
            Premium bow ties for your special occasions
          </p>
          <div className="text-center">
            <a 
              href="/shop" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
