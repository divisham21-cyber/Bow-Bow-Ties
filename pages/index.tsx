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
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 lg:h-24">
              <div className="flex justify-between items-center">
                <div className="logo-container">
                  <img 
                    src="/bow_bow_ties.jpg" 
                    alt="Bow-Bow-Ties Logo" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <h1 className="text-3xl font-bold gradient-text">Bow-Bow-Ties</h1>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex md:hidden justify-center space-x-4 mt-2 mb-2">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Products</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Calendar</a>
              </nav>
              
              {/* Tablet Navigation */}
              <nav className="hidden md:flex lg:hidden justify-center space-x-6 mt-2 mb-2">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Products</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Calendar</a>
              </nav>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Products</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Calendar</a>
              </nav>
              
              <div className="flex items-center justify-center space-x-3 mt-2 lg:mt-0 lg:space-x-4">
                <a 
                  href="https://www.instagram.com/bow_bow_ties" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7" viewBox="0 0 24 24">
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
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <svg className="w-7 h-7" fill="white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </a>
                <a 
                  href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Shop on Etsy"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <text
                        x="12"
                        y="17"
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="900"
                        fontFamily="Arial, sans-serif"
                        stroke="white"
                        strokeWidth="0.3"
                      >
                        E
                      </text>
                    </svg>
                  </div>
                </a>
                <a 
                  href="https://buymeacoffee.com/bowbowties" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                  aria-label="Buy Me a Coffee"
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                    <img 
                      src="/images/donate.jpeg" 
                      alt="Buy Me a Coffee" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Holiday Designs Banner */}
        <div 
          className="text-black border-green-300 border-b relative overflow-hidden bg-green-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-bounce">🎄</span>
                <div className="text-center">
                  <h3 className="font-bold text-3xl" style={{ textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff, 1px 1px 0px #fff, -1px -1px 0px #fff, 1px -1px 0px #fff, -1px 1px 0px #fff' }}>Holiday Designs Coming Soon!</h3>
                </div>
                <span className="text-xl animate-bounce">🎁</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Event Banner */}
        <div className="bg-pink-100 text-pink-800 border-pink-200 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="font-semibold text-lg">Next Event: Kenmore Winterfest</h3>
                  <p className="text-sm opacity-75">
                    Friday, December 6, 2025 at 11:00AM-3:00PM
                  </p>
                </div>
              </div>
              <span className="text-xs uppercase font-medium px-3 py-1 rounded-full bg-white bg-opacity-50">
                marketplace
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Pet Accessories with a 
                <span className="gradient-text"> Purpose</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Make your furry friend the most dapper companion with our handmade collection of accessories, while providing for an animal in need. 
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
        <section id="products" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Bow-Bow Ties?</h3>
              <p className="text-lg text-gray-600 mb-8">For pets, by hearts that care — every piece supports an animal in need.</p>
              
              <div className="bg-primary-50 rounded-lg p-8 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">💰</span>
                    <h4 className="text-xl font-semibold text-gray-900">Donation</h4>
                    <p className="text-gray-600">We donate 50% of our sales proceeds to animal shelter</p>
                  </div>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🛍️</span>
                    <h4 className="text-xl font-semibold text-gray-900">Collections</h4>
                    <p className="text-gray-600">We make pet bow ties, bandanas, necklaces, and neckbands</p>
                  </div>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🪡</span>
                    <h4 className="text-xl font-semibold text-gray-900">Handmade</h4>
                    <p className="text-gray-600">Handmade by a youth entrepreneur with a passion for animals</p>
                  </div>
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">❤️</span>
                    <h4 className="text-xl font-semibold text-gray-900">Cause</h4>
                    <p className="text-gray-600">Our cause is to help animals in the shelter get adopted</p>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-sm">
                    <span className="text-lg font-semibold text-gray-900">Be Part of the Change. Dress your Pet with Purpose.</span>
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

        {/* Our Impact Section */}
        <section id="impact" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h3>
              <p className="text-lg text-gray-600">See how your support has made a difference in the lives of animals</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-yellow-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">$7,500+</div>
                <div className="text-lg font-medium text-gray-900">Amount Donated</div>              
              </div>
              
              <div className="bg-blue-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-lg font-medium text-gray-900">Shelters Supported</div>  
              </div>
              
              <div className="bg-green-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">400+ LBs</div>
                <div className="text-lg font-medium text-gray-900">Pet Food Donated</div>
              </div>
              
              <div className="bg-purple-100 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">68</div>
                <div className="text-lg font-medium text-gray-900">Dogs Microchipped</div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 italic">
                "Making the world a better place one bow at a time"
              </p>
            </div>
          </div>
        </section>

        {/* How Do We Support Section */}
        <section id="support" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">🐾 How Do We Support? 🐾</h3>
              <p className="text-lg text-gray-600">See how your support makes a difference</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary-50 rounded-lg p-8 md:p-12">
                <div className="space-y-6 text-gray-700">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">💰</span>
                    <p className="text-lg">Donating 50% of sales proceeds donated to animal shelters to help provide food, medical care, and training to animals in need.</p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">🏷️</span>
                    <p className="text-lg">Supporting microchipping & pet food drives for low income group with pets.</p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">🤝</span>
                    <p className="text-lg">Partnering in fundraising events for animal welfare.</p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">🎯</span>
                    <p className="text-lg">Raising awareness about animal adoption.</p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">🏠</span>
                    <p className="text-lg">Creating beautiful accessories that help shelter animals look their best for adoption photos.</p>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-sm">
                    <span className="text-lg font-semibold text-gray-900">Made with Love, Driven by Purpose</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Banner */}
            <div className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="relative">
                <div className="w-full" style={{ aspectRatio: '2528/1126' }}>
                  <img 
                    src="/bowbowtiebanner.jpeg" 
                    alt="Bow-Bow-Ties Hero Banner" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow-2xl" style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000' }}>
                      About Bow-Bow-Ties
                    </h2>
                    <p className="text-lg md:text-xl drop-shadow-xl" style={{ textShadow: '1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000' }}>
                      Making The World A Better Place For Animals
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-lg p-8 shadow-md">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🐾</span>
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">From the Founder - Divisha M</h4>
                  <div className="text-left space-y-4">
                    <p className="text-gray-600">I started Bow-Bow Ties in 2021 when I was 9 years old with a mission to make the world a better place for animals. I wanted to help animals in shelters by creating adorable bow ties that would make them look cuter in adoption photo shoots and increase their chances of finding loving homes.</p>
                    <p className="text-gray-600">I started by making bow ties and gifting them to local animal shelters. But I was not sure, if it was enough and I was looking to do more.</p>
                    <p className="text-gray-600">In Summer 2021, I decided to sell a few bow ties at a lemonade stand, where I got a positive response. I realized that this allowed me to raise funds for the shelters which might be more helpful than gifting the bow ties. I started participating in pop-up stalls, children's business fairs, and establishing an online presence, and donated 50% of my sale proceeds.</p>
                     <p className="text-gray-600">The best part of my job is dressing up my pup Trixie, my supermodel along with hundreds of adorable animals!</p>
                    <p className="text-gray-600">Since starting in 2021, we have donated over $7,500 and supported over 15 animal shelters. I hope that with your support, we can help raise funds for even more animals in need!</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <img 
                      src="/images/divisha.jpeg" 
                      alt="Divisha M - Founder of Bow-Bow-Ties" 
                      className="w-full max-w-lg h-80 rounded-lg object-cover"
                    />
                    <p className="text-center text-sm text-gray-600 mt-3 font-medium">Divisha M, Founder & CEO</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <img 
                      src="/images/divisha_with_trixie.jpeg" 
                      alt="Divisha with Trixie" 
                      className="w-full max-w-lg h-80 rounded-lg object-cover"
                    />
                    <p className="text-center text-sm text-gray-600 mt-3 font-medium">Divisha with Trixie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recognition Section */}
        <section id="recognition" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Recognition & Awards</h3>
              <p className="text-lg text-gray-600">Celebrating the achievements and recognition Bow-Bow-Ties has received over the years</p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              {/* Desktop: 2 rows layout, Mobile: stacked */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* First row - 4 images */}
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/janegoodall.jpeg" 
                    alt="Jane Goodall Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/presidentletter.jpeg" 
                    alt="Presidential Letter Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/YSA.jpeg" 
                    alt="YSA Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/CEM.jpeg" 
                    alt="CEM Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
              </div>
              
              {/* Second row - 3 images centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/expressionarts.png" 
                    alt="Expression Arts Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/youth4us.jpeg" 
                    alt="Youth4US Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src="/Recognition/jackson.jpeg" 
                    alt="Jackson Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-600 italic">
                  "These recognitions inspire us to continue our mission of helping animals in need."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-lg text-gray-600">Have questions about our products? We'd love to hear from you!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information - Left on Desktop */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h4>
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
                      <span>Always Open!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Section - Right on Desktop */}
              <div className="flex justify-center">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <img 
                    src="I_support_bbt.jpeg" 
                    alt="I support bow-bow ties" 
                    className="w-full max-w-xs h-64 rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h5 className="text-xl font-bold mb-4">🎀 Bow-Bow-Ties</h5>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.instagram.com/bow_bow_ties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 p-0.5">
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <defs>
                            <linearGradient id="instagram-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#833ab4"/>
                              <stop offset="50%" stopColor="#fd1d1d"/>
                              <stop offset="100%" stopColor="#fcb045"/>
                            </linearGradient>
                          </defs>
                          <path fill="url(#instagram-gradient-footer)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  </a>
                  <a 
                    href="https://www.etsy.com/shop/bowbowtiesdesigns" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Shop on Etsy"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <text
                          x="12"
                          y="17"
                          textAnchor="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="900"
                          fontFamily="Arial, sans-serif"
                          stroke="white"
                          strokeWidth="0.3"
                        >
                          E
                        </text>
                      </svg>
                    </div>
                  </a>
                  <a 
                    href="https://buymeacoffee.com/bowbowties" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-110"
                    aria-label="Buy Me a Coffee"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden">
                      <img 
                        src="/images/donate.jpeg" 
                        alt="Buy Me a Coffee" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </a>
                </div>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Quick Links</h6>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="/products" className="hover:text-white transition-colors">Products</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/calendar" className="hover:text-white transition-colors">Calendar</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
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
