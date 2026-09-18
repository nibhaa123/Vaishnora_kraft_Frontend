import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/frontend_assets/assets'
import { apiFetch, getBackendUrl, readApiError } from '../utils/api'
import { formatCurrency } from '../utils/format'

const Home = () => {
  const slides = [
    {
      image: assets.giftHamperImg,
      eyebrow: 'Customized Gifts & Hampers',
      title: 'Made for every celebration.',
      detail:
        'Beautifully curated gifts for marriage, couples, festivals, kids, and every special moment.',
    },
    {
      image: assets.weddingGiftHamperImg,
      eyebrow: 'Personalized for you',
      title: 'Make every moment feel personal.',
      detail:
        'Create thoughtful gift hampers filled with things your loved ones will truly enjoy.',
    },
    {
      image: assets.festivalHamperImg,
      eyebrow: 'Local delivery, made easy',
      title: 'Joy delivered to your doorstep.',
      detail:
        'Enjoy free home delivery within 4–5 km for your next thoughtful surprise.',
    },
  ]

  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Products now come from MongoDB/backend
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [productError, setProductError] = useState('')

  // -----------------------------
  // LOAD FEATURED PRODUCTS
  // -----------------------------
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setProductError('')

        const response = await apiFetch('/api/products')

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              'Could not load products'
            )
          )
        }

        const data = await response.json()

        const productList = Array.isArray(data)
          ? data
          : data.products || []

        // Only featured/bestseller products
        const featured = productList
          .filter((product) => product.bestseller === true)
          .slice(0, 4)

        setFeaturedProducts(featured)
      } catch (error) {
        setProductError(
          error.message || 'Could not load products.'
        )
      }
    }

    loadFeaturedProducts()
  }, [])

  // -----------------------------
  // AUTO SLIDER
  // -----------------------------
  useEffect(() => {
    if (isPaused) return undefined

    const timer = window.setInterval(() => {
      setActiveSlide(
        (currentSlide) =>
          (currentSlide + 1) % slides.length
      )
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isPaused, slides.length])

  const goToSlide = (slideIndex) => {
    setActiveSlide(
      (slideIndex + slides.length) % slides.length
    )
  }

  const currentSlide = slides[activeSlide]

  return (
    <main className="bg-stone-50 text-slate-900">

      {/* =========================================
          HERO SLIDER
      ========================================= */}
      <section
        className="group relative isolate min-h-[520px] overflow-hidden bg-[#f8d7d2] sm:min-h-[600px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-roledescription="carousel"
        aria-label="Featured gifts"
      >
        {slides.map((slide, slideIndex) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            aria-hidden={slideIndex !== activeSlide}
            className={`absolute inset-0 -z-10 h-full w-full object-cover object-center transition-opacity duration-700 ${
              slideIndex === activeSlide
                ? 'opacity-100'
                : 'opacity-0'
            }`}
          />
        ))}

        <div className="relative z-10 flex min-h-[520px] max-w-7xl items-center px-6 py-16 sm:min-h-[600px] sm:px-10 lg:px-16">
          <div className="max-w-md">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-teal-200 drop-shadow-lg">
              {currentSlide.eyebrow}
            </p>

            <h1 className="font-sans text-4xl font-bold leading-[0.98] tracking-tight text-white drop-shadow-lg sm:text-7xl">
              {currentSlide.title}
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-slate-100 drop-shadow-lg">
              {currentSlide.detail}
            </p>

            <Link
              to="/collection"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-yellow-300 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 sm:w-auto sm:px-6"
            >
              Find the perfect gift
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>

        {/* Previous */}
        <button
          type="button"
          onClick={() => goToSlide(activeSlide - 1)}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-slate-950 opacity-0 shadow-lg transition-opacity hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 group-hover:opacity-100"
        >
          &lt;
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={() => goToSlide(activeSlide + 1)}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-slate-950 opacity-0 shadow-lg transition-opacity hover:bg-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-300 group-hover:opacity-100"
        >
          &gt;
        </button>

        {/* Slider dots */}
        <div
          className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2"
          aria-label="Choose a slide"
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goToSlide(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={
                slideIndex === activeSlide
                  ? 'true'
                  : undefined
              }
              className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
                slideIndex === activeSlide
                  ? 'w-8 bg-yellow-300'
                  : 'w-2.5 bg-white/70 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* =========================================
          FEATURES STRIP
      ========================================= */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:px-16">
          <p className="py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Customized Gifts &amp; Hampers
          </p>

          <p className="py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Marriage and couple gifts
          </p>

          <p className="py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Festival and kids gifts
          </p>

          <p className="py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            Free delivery within 4–5 km
          </p>
        </div>
      </div>

      {/* =========================================
          SHOP BY OCCASION
      ========================================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Shop by occasion
            </p>

            <h2 className="mt-2 font-serif text-3xl text-slate-950 sm:text-4xl">
              Find a gift for every moment
            </h2>
          </div>

          <Link
            to="/collection"
            className="text-sm font-semibold text-teal-800 transition-colors hover:text-teal-950"
          >
            View all gifts -&gt;
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Marriage gifts',
              detail:
                'Personalized hampers for their big day',
              image: assets.weddingGiftHamperImg,
              path: '/collection',
            },
            {
              label: 'Couple gifts',
              detail:
                'Romantic surprises made for two',
              image: assets.coupleGiftImg,
              path: '/collection',
            },
            {
              label: 'Festival gifts',
              detail:
                'Celebrate with beautiful festive hampers',
              image: assets.festivalHamperImg,
              path: '/collection',
            },
            {
              label: 'Kids gifts',
              detail:
                'Fun return gifts for little celebrations',
              image: assets.kidsGiftImg,
              path: '/collection',
            },
          ].map((category) => (
            <Link
              key={category.label}
              to={category.path}
              className="group overflow-hidden border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <img
                  src={category.image}
                  alt={`${category.label} gift ideas`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-slate-950">
                    {category.label}
                  </h3>

                  <span
                    className="text-xl text-teal-700 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    -&gt;
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {category.detail}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================
          VAISHNORA KRAFT TOUCH
      ========================================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              The Vaishnora Kraft touch
            </p>

            <h2 className="mt-2 font-serif text-3xl text-slate-950 sm:text-4xl">
              More than a gift
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Every order is prepared to make the moment feel personal.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [
              '01',
              'Gift wrapping',
              'Beautifully wrapped and ready to give.',
            ],
            [
              '02',
              'Personal notes',
              'Add your own message to every surprise.',
            ],
            [
              '03',
              'Reliable delivery',
              'Delivered with care for the important date.',
            ],
          ].map(([number, title, detail]) => (
            <div
              key={title}
              className="border border-slate-200 bg-white p-6"
            >
              <span className="text-sm font-semibold text-teal-700">
                {number}
              </span>

              <h3 className="mt-5 font-serif text-2xl text-slate-950">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================
          MOST LOVED GIFTS
      ========================================= */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                The edit
              </p>

              <h2 className="mt-2 font-serif text-3xl text-slate-950 sm:text-4xl">
                Most-loved gifts
              </h2>
            </div>

            <Link
              to="/collection"
              className="text-sm font-semibold text-teal-800 transition-colors hover:text-teal-950"
            >
              Explore the edit -&gt;
            </Link>
          </div>

          {/* Backend error */}
          {productError && (
            <p className="mt-6 text-sm font-medium text-red-600">
              {productError}
            </p>
          )}

          {/* No featured products */}
          {!productError &&
            featuredProducts.length === 0 && (
              <p className="mt-8 text-sm text-slate-500">
                No featured gifts available yet.
              </p>
            )}

          {/* Products */}
          {featuredProducts.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const productImage = getBackendUrl(Array.isArray(
                  product.image
                  )
                  ? product.image[0]
                  : product.image)

                return (
                  <Link
                    to={`/product/${product._id}`}
                    key={product._id}
                    className="group"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        {product.category}
                      </p>

                      <h3 className="mt-1 truncate text-sm font-medium text-slate-900 group-hover:text-teal-800">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          BENEFITS
      ========================================= */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3 sm:px-10 lg:px-16">
        {[
          {
            icon: assets.exchange_icon,
            title: 'Easy exchange',
            detail: 'Simple returns within 30 days.',
          },
          {
            icon: assets.quality_icon,
            title: 'Quality first',
            detail: 'Made with materials that last.',
          },
          {
            icon: assets.support_img,
            title: 'Here to help',
            detail: 'Real support when you need it.',
          },
        ].map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center gap-4 sm:block"
          >
            <img
              src={benefit.icon}
              alt=""
              className="h-9 w-9 object-contain sm:mb-4"
            />

            <div>
              <h3 className="text-sm font-semibold text-slate-950">
                {benefit.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {benefit.detail}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* =========================================
          CONTACT BUTTON
      ========================================= */}
      <Link
        to="/contact"
        aria-label="Contact admin"
        title="Contact admin"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-teal-800 text-white shadow-lg transition hover:bg-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17.5 4.5 20l.7-3.8A7.5 7.5 0 0 1 4 12.5C4 8.4 7.6 5 12 5s8 3.4 8 7.5-3.6 7.5-8 7.5c-1.8 0-3.6-.5-5-1.5Z"
          />

          <path
            strokeLinecap="round"
            d="M8.5 12h.01M12 12h.01M15.5 12h.01"
          />
        </svg>
      </Link>
    </main>
  )
}

export default Home
