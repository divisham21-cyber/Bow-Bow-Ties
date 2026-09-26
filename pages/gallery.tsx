import Head from 'next/head'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { GalleryPhoto, getGalleryPhotosFromDb } from '../lib/gallery'

interface GalleryPageProps {
  photos: GalleryPhoto[]
}

export default function GalleryPage({ photos }: GalleryPageProps) {
  return (
    <>
      <Head>
        <title>Gallery - Bow Bow Ties</title>
        <meta name="description" content="Photo gallery from Bow-Bow Ties customers, events, and community moments." />
      </Head>

      <main className="min-h-screen bg-orange-50">
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:h-24 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <Link href="/" className="logo-container">
              <img src="/bow_bow_ties.png" alt="Bow-Bow-Ties Logo" className="h-16 w-16 rounded-full object-cover" />
              <h1 className="text-3xl font-bold gradient-text">Bow-Bow Ties</h1>
            </Link>

            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 lg:gap-x-8">
              <Link href="/" className="text-base font-bold text-slate-700 transition-colors hover:text-primary-600 lg:text-lg">Home</Link>
              <Link href="/products" className="text-base font-bold text-slate-700 transition-colors hover:text-primary-600 lg:text-lg">Shop</Link>
              <a href="/#about" className="text-base font-bold text-slate-700 transition-colors hover:text-primary-600 lg:text-lg">About</a>
              <Link href="/calendar" className="text-base font-bold text-slate-700 transition-colors hover:text-primary-600 lg:text-lg">Events</Link>
              <Link href="/gallery" className="text-base font-bold text-primary-600 lg:text-lg">Gallery</Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-700">Photo Gallery</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950 sm:text-5xl">Gallery - Bow Bow Ties</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              A peek at Bow-Bow Ties moments from pets, pop-ups, treats, and the community that makes this mission possible.
            </p>
          </div>

          {photos.length ? (
            <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
              {photos.map((photo, index) => (
                <figure
                  key={photo.id}
                  className={`mb-5 break-inside-avoid overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-orange-100 ${
                    index % 5 === 1 ? 'lg:mt-10' : ''
                  }`}
                >
                  <img src={photo.imageUrl} alt={photo.title || 'Bow-Bow Ties gallery photo'} className="h-auto w-full object-cover" />
                  {photo.title ? (
                    <figcaption className="px-4 py-3 text-sm font-semibold text-slate-800">{photo.title}</figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-2xl rounded-lg border border-orange-200 bg-white px-6 py-10 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">Photos coming soon</h3>
              <p className="mt-3 text-slate-600">New Bow-Bow Ties gallery moments will appear here soon.</p>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<GalleryPageProps> = async () => {
  const photos = await getGalleryPhotosFromDb(false)
  return { props: { photos } }
}
