import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Bow Bow Ties
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-600 hover:text-gray-800 transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
              About
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-gray-800 transition-colors">
              Events
            </Link>
            <Link href="/impact" className="text-gray-600 hover:text-gray-800 transition-colors">
              Impact
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
