export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Bow Bow Ties</h3>
            <p className="text-gray-300">
              Premium bow ties for your special occasions. Quality craftsmanship and timeless style.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/shop" className="text-gray-300 hover:text-white transition-colors">Shop</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
              <li><a href="/events" className="text-gray-300 hover:text-white transition-colors">Events</a></li>
              <li><a href="/impact" className="text-gray-300 hover:text-white transition-colors">Impact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 mb-2">Email: info@bowbowties.com</p>
            <p className="text-gray-300">Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2024 Bow Bow Ties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
