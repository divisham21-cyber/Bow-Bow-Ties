import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  etsyUrl: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Classic Red Bow Tie",
    price: 9.99,
    image: "/images/red-bowtie.jpg",
    category: "bow-ties",
    description: "Elegant red bow tie perfect for special occasions",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 2,
    name: "Polka Dot Blue Bow Tie",
    price: 9.99,
    image: "/images/blue-polka-bowtie.jpg",
    category: "bow-ties",
    description: "Playful polka dot design in classic blue",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 3,
    name: "Formal Black Bow Tie",
    price: 9.99,
    image: "/images/black-bowtie.jpg",
    category: "bow-ties",
    description: "Sophisticated black bow tie for formal events",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 4,
    name: "Floral Print Bow Tie",
    price: 9.99,
    image: "/images/floral-bowtie.jpg",
    category: "bow-ties",
    description: "Beautiful floral pattern for spring occasions",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 5,
    name: "Striped Navy Bow Tie",
    price: 9.99,
    image: "/images/navy-striped-bowtie.jpg",
    category: "bow-ties",
    description: "Classic navy stripes for a timeless look",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 6,
    name: "Plaid Green Bow Tie",
    price: 9.99,
    image: "/images/green-plaid-bowtie.jpg",
    category: "bow-ties",
    description: "Festive plaid pattern in rich green tones",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 7,
    name: "Velvet Purple Bow Tie",
    price: 12.99,
    image: "/images/purple-velvet-bowtie.jpg",
    category: "bow-ties",
    description: "Luxurious velvet texture in royal purple",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 8,
    name: "Gingham Pink Bow Tie",
    price: 9.99,
    image: "/images/pink-gingham-bowtie.jpg",
    category: "bow-ties",
    description: "Sweet gingham pattern in soft pink",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 9,
    name: "Leopard Print Bow Tie",
    price: 11.99,
    image: "/images/leopard-bowtie.jpg",
    category: "bow-ties",
    description: "Wild leopard print for adventurous pets",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 10,
    name: "Christmas Holly Bow Tie",
    price: 9.99,
    image: "/images/holly-bowtie.jpg",
    category: "bow-ties",
    description: "Festive holly pattern for holiday celebrations",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 11,
    name: "Denim Blue Bow Tie",
    price: 10.99,
    image: "/images/denim-bowtie.jpg",
    category: "bow-ties",
    description: "Casual denim texture for everyday wear",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  },
  {
    id: 12,
    name: "Gold Sparkle Bow Tie",
    price: 14.99,
    image: "/images/gold-sparkle-bowtie.jpg",
    category: "bow-ties",
    description: "Glamorous gold sparkles for special occasions",
    etsyUrl: "https://www.etsy.com/shop/bowbowtiesdesigns"
  }
]

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  return (
    <>
      <Head>
        <title>Premium Collection - Bow-Bow-Ties</title>
        <meta name="description" content="Discover our top 12 premium bow ties and accessories for your beloved pets. Handcrafted designs available on Etsy." />
      </Head>

      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
              <Link href="/" className="logo-container">
                <img 
                  src="/bow_bow_ties.jpg" 
                  alt="Bow-Bow-Ties Logo" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <h1 className="text-3xl font-bold gradient-text">Bow-Bow-Ties</h1>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</Link>
                <Link href="/products" className="text-primary-600 font-semibold">Products</Link>
                <a href="/#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
                <a href="/#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
              </nav>
              <div className="flex items-center space-x-6">
                <a 
                  href="https://www.instagram.com/bow_bow_ties" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                      <svg className="w-10 h-10" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#833ab4"/>
                            <stop offset="50%" stopColor="#fd1d1d"/>
                            <stop offset="100%" stopColor="#fcb045"/>
                          </linearGradient>
                        </defs>
                        <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                </a>
                <a 
                  href="https://www.facebook.com/p/Bow-Bow-Ties-100071472273808/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Facebook"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-10 h-10" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </a>
                <a 
                  href="https://bow-bowties.wordpress.com/about/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Visit our WordPress blog"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <text
                        x="12"
                        y="17"
                        textAnchor="middle"
                        fill="white"
                        fontSize="18"
                        fontWeight="900"
                        fontFamily="Arial, sans-serif"
                        stroke="white"
                        strokeWidth="0.5"
                      >
                        W
                      </text>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Products Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Collection</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover our top 12 handcrafted bow ties designed for comfort and style. 
                Each piece is carefully crafted with premium materials and available on our Etsy store.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setSelectedCategory('bow-ties')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'bow-ties'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bow Ties
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🎀</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary-600">${product.price}</span>
                    <a 
                      href={product.etsyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm"
                    >
                      View on Etsy
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-primary-50 rounded-lg p-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🎀 Visit Our Etsy Store</h3>
                <p className="text-gray-600 mb-6">
                  Browse our complete collection and discover even more unique designs. 
                  All products are handcrafted with love and shipped directly from our Etsy store.
                </p>
                <a 
                  href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary text-lg px-8 py-3 inline-block"
                >
                  Shop All Products on Etsy
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h5 className="text-xl font-bold mb-4">🎀 Bow-Bow-Ties</h5>
                <p className="text-gray-400">
                  Premium pet accessories for the most stylish companions.
                </p>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Quick Links</h6>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
                  <li><a href="/#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Categories</h6>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Bow Ties</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Collars</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Gift Sets</a></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Contact</h6>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 hello@bowbowties.com</li>
                  <li>📞 (555) 123-4567</li>
                  <li>📍 123 Pet Street, City, State</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Bow-Bow-Ties. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
