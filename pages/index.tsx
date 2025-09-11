import { useState } from 'react'
import Head from 'next/head'

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
}

const products: Product[] = [
  {
    id: 1,
    name: "Classic Red Bow Tie",
    price: 24.99,
    image: "/images/red-bowtie.jpg",
    category: "bow-ties",
    description: "Elegant red bow tie perfect for special occasions"
  },
  {
    id: 2,
    name: "Polka Dot Blue Bow Tie",
    price: 27.99,
    image: "/images/blue-polka-bowtie.jpg",
    category: "bow-ties",
    description: "Playful polka dot design in classic blue"
  },
  {
    id: 3,
    name: "Formal Black Bow Tie",
    price: 29.99,
    image: "/images/black-bowtie.jpg",
    category: "bow-ties",
    description: "Sophisticated black bow tie for formal events"
  },
  {
    id: 4,
    name: "Floral Print Bow Tie",
    price: 26.99,
    image: "/images/floral-bowtie.jpg",
    category: "bow-ties",
    description: "Beautiful floral pattern for spring occasions"
  }
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  return (
    <>
      <Head>
        <title>Bow-Bow-Ties - Premium Pet Bow Ties & Accessories</title>
        <meta name="description" content="Discover our collection of stylish bow ties and accessories for your beloved pets. Premium quality, comfortable fit, and adorable designs." />
      </Head>

      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-24">
              <div className="logo-container">
                <img 
                  src="/bow_bow_ties.jpg" 
                  alt="Bow-Bow-Ties Logo" 
                  className="w-16 h-16 rounded-full object-cover"
                />
                <h1 className="text-3xl font-bold gradient-text">Bow-Bow-Ties</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#home" className="text-gray-700 hover:text-primary-600 transition-colors">Home</a>
                <a href="#products" className="text-gray-700 hover:text-primary-600 transition-colors">Products</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="text-gray-700 hover:text-primary-600">
                  🛒 Cart (0)
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Stylish Bow Ties for Your
                <span className="gradient-text"> Furry Friends</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Make your pet the most dapper companion with our premium collection of bow ties and accessories. 
                Comfortable, stylish, and perfect for any occasion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary text-lg px-8 py-3">
                  Shop Now
                </button>
                <button className="btn-secondary text-lg px-8 py-3">
                  View Collection
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Collection</h3>
              <p className="text-lg text-gray-600">Handcrafted bow ties designed for comfort and style</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🎀</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary-600">${product.price}</span>
                    <button className="btn-primary text-sm">Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Bow-Bow-Ties?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">✨</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Premium Quality</h4>
                      <p className="text-gray-600">Made with high-quality, pet-safe materials that are comfortable and durable.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">🎨</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Stylish Designs</h4>
                      <p className="text-gray-600">From classic to contemporary, we have designs for every occasion and personality.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">💝</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Perfect Fit</h4>
                      <p className="text-gray-600">Adjustable sizing ensures a comfortable fit for pets of all sizes.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-md">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🐕</span>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Happy Pets, Happy Owners</h4>
                  <p className="text-gray-600">
                    Join thousands of pet owners who trust Bow-Bow-Ties to make their furry friends look absolutely adorable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-lg text-gray-600">Have questions about our products? We'd love to hear from you!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-gray-50 rounded-lg p-8">
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h4>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="Tell us about your pet and what you're looking for..."
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-primary-600 text-xl">📧</span>
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <a href="mailto:hello@bowbowties.com" className="text-primary-600 hover:text-primary-700">
                          hello@bowbowties.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-primary-600 text-xl">📞</span>
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <a href="tel:+15551234567" className="text-primary-600 hover:text-primary-700">
                          (555) 123-4567
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-primary-600 text-xl">📍</span>
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">123 Pet Street<br />City, State 12345</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">🎀 Custom Orders</h4>
                  <p className="text-gray-600">
                    Looking for something special? We offer custom bow ties and accessories tailored to your pet's unique style. 
                    Contact us to discuss your custom order!
                  </p>
                </div>
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
                  <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#products" className="hover:text-white transition-colors">Products</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
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
