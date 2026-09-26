import Head from 'next/head'
import { useState } from 'react'
import MapComponent, { ProductLocation } from '../components/MapComponent'
import { formatPrice } from '../lib/catalog'
import { freeShippingThresholdCents } from '../lib/commerceConfig'
import { getNextEvent, getEventTypeColor, getEventTypeIcon } from '../lib/events'

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const nextEvent = getNextEvent()
  const productLocations: ProductLocation[] = [
    {
      name: 'Bobby Jo\'s Plants and Mercantile',
      address: '2252 NE 65th St, Seattle, WA 98115',
      lat: 47.67605272247147,
      lng: -122.30344141627994
    },
    {
      name: 'High Rock Meadow Sniffspot',
      address: 'High Rock, Monroe, Washington',
      lat: 47.809626204048435, 
      lng: -121.97043592683498
    },
    {
      name: 'A Pet Spa',
      address: '12811 8th Ave W Suite C105, Everett, WA 98204',
      lat: 47.88141182606392, 
      lng: -122.24365766045187
    },
    {
      name: 'The Dining Dog Cafe & Bakery',
      address: '9691 Firdale Ave, Edmonds, WA 98020',
      lat: 47.7790868650201, 
      lng: -122.36206563162037
    }
  ]

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
                    src="/bow_bow_ties.png" 
                    alt="Bow-Bow-Ties Logo" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <h1 className="text-3xl font-bold gradient-text">Bow-Bow Ties</h1>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex md:hidden justify-center space-x-4 mt-2 mb-2">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Shop</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-base font-bold">Events</a>
              </nav>
              
              {/* Tablet Navigation */}
              <nav className="hidden md:flex lg:hidden justify-center space-x-6 mt-2 mb-2">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Shop</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Events</a>
              </nav>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8">
                <a href="/products" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Shop</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">About</a>
                <a href="#impact" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Impact</a>
                <a href="/calendar" className="text-gray-700 hover:text-primary-600 transition-colors text-lg font-bold">Events</a>
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

        {/* Upcoming Event + Promotion Banner */}
        <div className={`${nextEvent ? getEventTypeColor(nextEvent.type) : 'bg-amber-300 text-slate-950 border-amber-400'} border-b`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {nextEvent ? (
              <div className="grid gap-3 text-center sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:text-left">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-2xl">{getEventTypeIcon(nextEvent.type)}</span>
                  <div>
                    <>
                      <h3 className="font-semibold text-lg">Next Event: {nextEvent.title}</h3>
                      <p className="text-sm opacity-75">
                        {new Date(nextEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} at {nextEvent.time}
                      </p>
                    </>
                  </div>
                </div>
                <p className="mx-auto inline-flex max-w-xs flex-wrap items-center justify-center gap-2 rounded-md bg-amber-300 px-3 py-1 text-sm font-bold text-slate-950 shadow-sm sm:max-w-none">
                  Use code <span className="rounded bg-white px-2 py-0.5 tracking-wide text-rose-700">WELCOME10</span> for 10% off
                  <span className="hidden text-slate-700 sm:inline">|</span>
                  <span>Free US shipping over {formatPrice(freeShippingThresholdCents)}</span>
                </p>
                <a href="/calendar" className="justify-self-center rounded-full bg-white bg-opacity-50 px-3 py-1 text-xs font-medium uppercase transition-colors hover:bg-opacity-75 sm:justify-self-end">
                  {nextEvent.type}
                </a>
              </div>
            ) : (
              <p className="flex w-full flex-wrap items-center justify-center gap-2 text-center text-sm font-bold sm:text-base">
                Use code <span className="rounded bg-white px-2 py-0.5 tracking-wide text-rose-700">WELCOME10</span> for 10% off
                <span className="hidden text-slate-700 sm:inline">|</span>
                <span>Free US shipping over {formatPrice(freeShippingThresholdCents)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <section id="home" className="bg-white pb-5 sm:pb-7">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-lg bg-slate-900 shadow-sm">
              <img
                src="/images/home-treats-banner.png"
                alt="Happy dog wearing a Bow-Bow-Ties bow tie beside a bag of dog treats"
                className="h-auto w-full"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:hidden" />
              <div className="absolute right-0 top-0 hidden h-full w-full bg-[radial-gradient(circle_at_88%_12%,rgba(15,23,42,0.68)_0%,rgba(15,23,42,0.54)_26%,rgba(15,23,42,0.29)_52%,rgba(15,23,42,0)_82%)] sm:block" />
              <div className="absolute inset-x-5 bottom-3 flex items-end justify-between gap-3 sm:hidden">
                <div className="max-w-[58%] text-left text-white shadow-sm">
                  <p className="text-base font-bold leading-snug">Bow-Bow Ties</p>
                  <p className="mt-1 text-sm font-bold leading-snug">For Pets We Love. For Animals in Need.</p>
                </div>
                <a
                  href="/products"
                  className="inline-flex shrink-0 rounded-lg border border-amber-300 bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
                >
                  Shop Now
                </a>
              </div>
              <div className="absolute inset-0 hidden items-start justify-end p-4 sm:flex sm:p-6 lg:p-8">
                <div className="max-w-xl text-center text-white sm:text-right">
                  <p className="text-3xl font-extrabold leading-none sm:text-5xl lg:text-6xl">
                    Bow-Bow Ties
                  </p>
                  <h2 className="mt-2 text-base font-bold leading-tight sm:text-2xl lg:text-3xl">
                    For Pets We Love. For Animals in Need.
                  </h2>
                  <p className="ml-auto mt-3 hidden max-w-lg text-sm leading-6 text-white/90 sm:block sm:text-base">
                    A youth-led, purpose driven pet brand. Handmade pet accessories and wholesome dog treats created with love and a purpose. Every purchase helps support animals in need.
                  </p>
                  <div className="mt-4 flex justify-center sm:mt-5 sm:justify-end">
                    <a
                      href="/products"
                      className="rounded-lg border border-amber-300 bg-amber-300 px-5 py-2 text-center text-sm font-bold text-slate-950 shadow-lg transition-colors hover:border-amber-400 hover:bg-amber-400 sm:px-6 sm:py-2.5 sm:text-base"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-slate-900 shadow-sm sm:min-h-[340px]">
                <img
                  src="/images/home-accessories-card.png"
                  alt="Dog and cat wearing Bow-Bow Ties pet accessories"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-6">
                  <p className="max-w-[52%] text-sm font-bold leading-snug text-white shadow-sm sm:max-w-[62%] sm:text-xl">
                    Bow Ties, Bandanas, Necklaces, more
                  </p>
                  <a
                    href="/products?category=bow-ties"
                    className="inline-flex shrink-0 rounded-lg border border-amber-300 bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400 sm:px-5 sm:text-base"
                  >
                    Shop Accessories
                  </a>
                </div>
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-slate-900 shadow-sm sm:min-h-[340px]">
                <img
                  src="/images/home-treats-card.png"
                  alt="Bow-Bow Treats bags with natural dog treat ingredients"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 sm:inset-x-6">
                  <p className="max-w-[52%] text-sm font-bold leading-snug text-white shadow-sm sm:max-w-[62%] sm:text-xl">
                    Wholesome clean ingredients, no preservative dog treats
                  </p>
                  <a
                    href="/products?category=bow-bow-treats"
                    className="inline-flex shrink-0 rounded-lg border border-amber-300 bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400 sm:px-5 sm:text-base"
                  >
                    Shop Pet Treats
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-5 grid overflow-hidden rounded-lg bg-rose-50 shadow-sm md:grid-cols-[1fr_1fr]">
              <div className="min-h-[240px] bg-slate-100 sm:min-h-[300px] md:min-h-[340px]">
                <img
                  src="/images/home-founder-banner.png"
                  alt="Divisha with a dog wearing a Bow-Bow Ties bow tie"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="relative flex items-center overflow-hidden px-5 py-6 sm:px-7 lg:px-8">
                <div className="absolute right-4 top-4 text-6xl text-rose-200/60" aria-hidden="true">♡</div>
                <div className="absolute right-8 top-12 h-20 w-20 rounded-full border-[12px] border-rose-200/30" aria-hidden="true" />
                <div className="relative max-w-2xl">
                  <p className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
                    Started at 9.
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold leading-tight text-rose-600 sm:text-3xl">
                    With One Simple Mission.
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-base">
                    At nine years old, Divisha started making bow ties for dogs to help support shelter animals. What began with handmade bow ties has grown into Bow-Bow Ties, now offering pet accessories and wholesome treats, while staying true to the same mission that started it all.
                  </p>
                  <a
                    href="#founder"
                    className="mt-5 inline-flex rounded-full border border-teal-700 bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-800"
                  >
                    Meet Divisha & Read Our Story →
                  </a>
                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-rose-200 pt-4 text-center">
                    <div className="rounded-lg bg-sky-100 px-2 py-2 text-sky-900">
                      <p className="text-xl" aria-hidden="true">🎓</p>
                      <p className="mt-1 text-xs font-bold sm:text-sm">Young Entrepreneur</p>
                    </div>
                    <div className="rounded-lg bg-rose-100 px-2 py-2 text-rose-900">
                      <p className="text-xl" aria-hidden="true">♥</p>
                      <p className="mt-1 text-xs font-bold sm:text-sm">$10,000+ Raised to Help Animals</p>
                    </div>
                    <div className="rounded-lg bg-teal-100 px-2 py-2 text-teal-900">
                      <p className="text-xl" aria-hidden="true">🐾</p>
                      <p className="mt-1 text-xs font-bold sm:text-sm">20 Animal Shelters Supported</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="bg-white pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-lg bg-primary-50 shadow-sm lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[280px] bg-slate-100 lg:min-h-full">
                <img
                  src="/images/home-why-pet-parents.png"
                  alt="Pet parent smiling with a dog wearing a Bow-Bow Ties bow tie"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-5 px-3 text-center text-white sm:inset-x-6 sm:px-0">
                  <h3 className="whitespace-nowrap text-lg font-bold leading-tight sm:text-2xl">Why Pet Parents Choose Bow-Bow Ties</h3>
                </div>
              </div>
              <div className="p-4 sm:p-5 lg:p-6">
                <p className="mb-4 text-center text-base font-bold text-rose-600">
                  Little things for your pet. A bigger difference for animals in need.
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left shadow-sm">
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center text-3xl">💰</span>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Every Purchase Gives Back</h4>
                      <p className="mt-0.5 text-sm leading-5 text-gray-600">Whether you shop accessories or treats, your purchase helps us support animals in need.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left shadow-sm">
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center text-3xl">🪡</span>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Made With Care</h4>
                      <p className="mt-0.5 text-sm leading-5 text-gray-600">Thoughtfully made pet accessories created by a young entrepreneur who loves animals.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left shadow-sm">
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center">
                      <img
                        src="/images/dog-biscuit.png"
                        alt=""
                        className="h-9 w-14 object-contain"
                      />
                    </span>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Wholesome Treats</h4>
                      <p className="mt-0.5 text-sm leading-5 text-gray-600">Simple, recognizable ingredients with no corn, wheat, or soy.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-white/70 p-3 text-left shadow-sm">
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center text-3xl">❤️</span>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Something Special for Every Pup</h4>
                      <p className="mt-0.5 text-sm leading-5 text-gray-600">Style your pets with bow ties, bandanas, and necklaces.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Impact Section */}
        <section id="impact" className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-gradient-to-r from-sky-50 via-teal-50 to-amber-50 p-5 shadow-sm sm:p-6">
              <div className="rounded-lg bg-gradient-to-r from-teal-500 via-sky-400 to-amber-300 px-5 py-4 text-center">
                <h3 className="text-2xl font-bold text-slate-950 sm:text-3xl">Our Impact</h3>
                <p className="mt-2 text-base font-semibold text-slate-900">See how your support has made a difference in the lives of animals</p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg bg-yellow-100 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">$10,000+</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">Amount Donated</div>
                </div>

                <div className="rounded-lg bg-blue-100 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">20+</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">Shelters Supported</div>
                </div>

                <div className="rounded-lg bg-green-100 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">400+ LBs</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">Pet Food Donated</div>
                </div>

                <div className="rounded-lg bg-purple-100 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">68</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">Dogs Microchipped</div>
                </div>

                <div className="rounded-lg bg-pink-100 p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">2,000+</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">Products Sold/Donated</div>
                </div>
              </div>

              <p className="mt-5 text-center text-sm font-semibold italic text-slate-900">
                "Making the world a better place for animals"
              </p>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section id="locations" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Where To Find Our Products</h3>
              <p className="text-lg text-gray-600">Explore Seattle-area retail locations carrying Bow-Bow Ties products.</p>
            </div>
            <MapComponent locations={productLocations} />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="founder" className="scroll-mt-24 mb-8 rounded-lg bg-gradient-to-r from-teal-500 via-sky-400 to-amber-300 px-5 py-5 text-center shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-950">Our Story</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">From the Founder - Divisha</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-lg p-8 shadow-md">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">🐾</span>
                  <div className="text-left space-y-4">
                    <p className="text-gray-600">I started Bow-Bow Ties in 2021 when I was 9 years old with a mission to make the world a better place for animals. I wanted to help animals in shelters by creating adorable bow ties that would make them look cuter in adoption photo shoots and increase their chances of finding loving homes.</p>
                    <p className="text-gray-600">I started by making bow ties and gifting them to local animal shelters. But I was not sure, if it was enough and I was looking to do more.</p>
                    <p className="text-gray-600">In Summer 2021, I decided to sell a few bow ties at a lemonade stand, where I got a positive response. I realized that this allowed me to raise funds for the shelters which might be more helpful than gifting the bow ties. I started participating in pop-up stalls, children's business fairs, and establishing an online presence, and donated 50% of my sale proceeds.</p>
                     <p className="text-gray-600">The best part of my job is dressing up my pup Trixie, my supermodel along with hundreds of adorable animals!</p>
                    <p className="text-gray-600">Since starting in 2021, we have donated over $10,000 and supported over 20 animal shelters. I hope that with your support, we can help raise funds for even more animals in need!</p>
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
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/janegoodall.jpeg')}
                >
                  <img 
                    src="/Recognition/janegoodall.jpeg" 
                    alt="Jane Goodall Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/presidentletter.jpeg')}
                >
                  <img 
                    src="/Recognition/presidentletter.jpeg" 
                    alt="Presidential Letter Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/YSA.jpeg')}
                >
                  <img 
                    src="/Recognition/YSA.jpeg" 
                    alt="YSA Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/CEM.jpeg')}
                >
                  <img 
                    src="/Recognition/CEM.jpeg" 
                    alt="CEM Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
              </div>
              
              {/* Second row - 3 images centered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/expressionarts.png')}
                >
                  <img 
                    src="/Recognition/expressionarts.png" 
                    alt="Expression Arts Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/youth4us.jpeg')}
                >
                  <img 
                    src="/Recognition/youth4us.jpeg" 
                    alt="Youth4US Recognition" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
                </div>
                <div 
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage('/Recognition/jackson.jpeg')}
                >
                  <img 
                    src="/Recognition/jackson.jpeg" 
                    alt="Jackson Recognition Award" 
                    className="w-full h-auto sm:h-48 object-contain sm:object-cover rounded-lg"
                  />
                  <p className="text-center text-sm text-gray-500 mt-2">Click to enlarge</p>
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
                        <a href="mailto:contact@bowbowties.us" className="text-primary-600 hover:text-primary-700">
                          contact@bowbowties.us
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

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-7xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all z-10"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage}
                alt="Impact photo enlarged"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

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
                  <li><a href="/products" className="hover:text-white transition-colors">Shop</a></li>
                  <li><a href="/subscriptions" className="hover:text-white transition-colors">Subscriptions</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/calendar" className="hover:text-white transition-colors">Events</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h6 className="font-semibold mb-4">Contact</h6>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 contact@bowbowties.us</li>
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
