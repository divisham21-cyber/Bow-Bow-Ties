import Head from 'next/head'

export default function Home() {

  return (
    <>
      <Head>
        <title>Bow-Bow-Ties - Premium Pet Bow Ties & Accessories</title>
        <meta name="description" content="Discover our collection of stylish bow ties and accessories for your furry friends. Handmade, Premium quality, comfortable fit, and adorable designs." />
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
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">Products</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors">Calendar</a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
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

        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Pet Accessories with a 
                <span className="gradient-text"> Purpose</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Make your furry friend the most dapper companion with our premium collection of bow ties and accessories. 
                Comfortable, stylish, and perfect for any occasion.
              </p>
              <div className="flex justify-center">
                <a 
                  href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary text-lg px-8 py-3 inline-block text-center"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Products Preview Section */}
        <section id="products" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Collection</h3>
              <p className="text-lg text-gray-600 mb-8">Handcrafted bow ties designed for comfort and style</p>
              
              <div className="bg-primary-50 rounded-lg p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🎀</span>
                    <h4 className="text-xl font-semibold text-gray-900">Top 12 Products</h4>
                    <p className="text-gray-600">Curated selection of our best sellers</p>
                  </div>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">✨</span>
                    <h4 className="text-xl font-semibold text-gray-900">Premium Quality</h4>
                    <p className="text-gray-600">Handcrafted with love and care</p>
                  </div>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🛍️</span>
                    <h4 className="text-xl font-semibold text-gray-900">Available on Etsy</h4>
                    <p className="text-gray-600">Shop directly from our store</p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center space-x-4">
                  <a 
                    href="/products"
                    className="btn-primary text-lg px-8 py-3 inline-block"
                  >
                    View All Products
                  </a>
                  <a 
                    href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                  >
                    Shop on Etsy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Banner */}
            <div className="mb-12">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/bowbowtiebanner.png" 
                  alt="Bow-Bow-Ties Hero Banner" 
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
                      About Bow-Bow-Ties
                    </h2>
                    <p className="text-xl md:text-2xl drop-shadow-md">
                      Crafting Style for Your Beloved Pets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose Bow-Bow-Ties?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">🎀</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Support in Style</h4>
                      <p className="text-gray-600">Styling your pet while providing for an animal in need.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">🐕</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Helping Animals</h4>
                      <p className="text-gray-600">Supporting a shelter working endlessly to care for animals.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-primary-600 text-xl">💝</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Motivating a Youth Entrepreneur</h4>
                      <p className="text-gray-600">Encouraging a compassionate young girl entrepreneur to grow.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-md">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🐾</span>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">❤️From the Founder - Divisha M❤️</h4>
                  <p className="text-gray-600">
                    Hi! I’m the founder of Bow-Bow Ties, a purpose driven business with a mission to make the world a better place for animals. We have donated over $7,500 so far, and I hope that with your support, we can help raise funds for even more animals in the shelters! </p>
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
                        <a href="mailto:bowbowties21@gmail.com" className="text-primary-600 hover:text-primary-700">
                          bowbowties21@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-primary-600 text-xl">📍</span>
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600">Bothell, Washington</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Sunday - Saturday</span>
                      <span>Always Open!</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">🎀 Return Policy</h4>
                  <p className="text-gray-600">
                    Since we make all the bow ties ourselves, we do not accept returns or refunds.
                    Contact us to see if we can help!
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
                  <li>📧 bowbowties21@gmail.com</li>
                  <li>📍 Bothell, Washington</li>
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
