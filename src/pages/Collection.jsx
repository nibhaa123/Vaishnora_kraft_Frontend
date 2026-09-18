import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, getBackendUrl, readApiError } from '../utils/api'
import { formatCurrency } from '../utils/format'

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || 'All'
  const searchQuery = searchParams.get('search') || ''
  const bestsellerOnly =
    searchParams.get('bestseller') === 'true'

  const [sort, setSort] = useState('Featured')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categoryOptions = [
    ['All', 'All gifts'],
    ['Festival Gifts', 'Festivals'],
    ['Birthday Gifts', 'Birthday'],
    ['Wedding Gifts', 'Wedding'],
    ['Anniversary Gifts', 'Anniversary'],
    ['Decorative Ideas', 'Decor'],
  ]

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

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

        setProducts(productList)
      } catch (requestError) {
        setError(
          requestError.message ||
            'Could not load products.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Search + filter + sort
  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    const filteredProducts = products
      .filter((product) => {
        return (
          category === 'All' ||
          product.category === category
        )
      })
      .filter((product) => {
        return (
          !bestsellerOnly ||
          product.bestseller === true
        )
      })
      .filter((product) => {
        if (!query) {
          return true
        }

        const name =
          product.name?.toLowerCase() || ''

        const productCategory =
          product.category?.toLowerCase() || ''

        const description =
          product.description?.toLowerCase() || ''

        return (
          name.includes(query) ||
          productCategory.includes(query) ||
          description.includes(query)
        )
      })

    return [...filteredProducts].sort(
      (first, second) => {
        if (sort === 'Price: low to high') {
          return (
            Number(first.price || 0) -
            Number(second.price || 0)
          )
        }

        if (sort === 'Price: high to low') {
          return (
            Number(second.price || 0) -
            Number(first.price || 0)
          )
        }

        return (
          Number(second.bestseller) -
          Number(first.bestseller)
        )
      }
    )
  }, [
    products,
    category,
    bestsellerOnly,
    sort,
    searchQuery,
  ])

  // Product image
  const getProductImage = (product) => {
    if (Array.isArray(product.image)) {
      return getBackendUrl(product.image[0] || '')
    }

    return getBackendUrl(product.image || '')
  }

  // Category change
  const handleCategoryChange = (value) => {
    const params = {}

    if (searchQuery) {
      params.search = searchQuery
    }

    if (value !== 'All') {
      params.category = value
    }

    if (bestsellerOnly) {
      params.bestseller = 'true'
    }

    setSearchParams(params)
  }

  // Clear search
  const clearSearch = () => {
    const params = {}

    if (category !== 'All') {
      params.category = category
    }

    if (bestsellerOnly) {
      params.bestseller = 'true'
    }

    setSearchParams(params)
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">

      {/* Header */}
      <div className="border-b border-slate-200 pb-10">

        <p className="section-badge">
          The gifting edit
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <h1 className="font-serif text-4xl text-slate-950 sm:text-5xl">
              Find your perfect gift
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Curated boxes, personalized hampers,
              and meaningful moments for what matters most.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {visibleProducts.length} curated gifts
          </p>

        </div>

        {/* Search information */}
        {searchQuery && (
          <div className="mt-5 flex flex-wrap items-center gap-3">

            <p className="text-sm text-slate-600">
              Search results for:
              <span className="ml-1 font-semibold text-slate-900">
                "{searchQuery}"
              </span>
            </p>

            <button
              type="button"
              onClick={clearSearch}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              Clear search
            </button>

          </div>
        )}

      </div>

      {/* Category + Sort */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 py-5 sm:flex-row sm:items-center">

        {/* Categories */}
        <div className="flex flex-wrap gap-2 sm:overflow-x-auto">

          {categoryOptions.map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  handleCategoryChange(value)
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                  category === value
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                }`}
              >
                {label}
              </button>
            )
          )}

        </div>

        {/* Sort */}
        <label className="flex items-center gap-2 text-sm text-slate-500">

          Sort by

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
            className="border-0 bg-transparent font-medium text-slate-900 focus:ring-0"
          >
            <option value="Featured">
              Featured
            </option>

            <option value="Price: low to high">
              Price: low to high
            </option>

            <option value="Price: high to low">
              Price: high to low
            </option>
          </select>

        </label>

      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <p className="text-sm text-slate-500">
            Loading gifts...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="py-20 text-center">

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-teal-800 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-950"
          >
            Try again
          </button>

        </div>
      )}

      {/* Products */}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-10 sm:grid-cols-3 lg:grid-cols-4">

          {visibleProducts.length > 0 ? (

            visibleProducts.map((product) => {
              const productImage =
                getProductImage(product)

              return (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="group"
                >

                  {/* Image */}
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200">

                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name || 'Product'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        No image
                      </div>
                    )}

                  </div>

                  {/* Category + Bestseller */}
                  <div className="mt-4 flex items-center justify-between gap-2">

                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      {product.category}
                    </p>

                    {product.bestseller === true && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                        Best seller
                      </span>
                    )}

                  </div>

                  {/* Name */}
                  <h2 className="mt-1 truncate text-sm font-medium text-slate-900 group-hover:text-teal-800">
                    {product.name}
                  </h2>

                  {/* Description */}
                  {product.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatCurrency(product.price)}
                  </p>

                </Link>
              )
            })

          ) : (

            /* No products */
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <p className="text-base font-medium text-slate-700">
                No gifts found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {searchQuery
                  ? `No products match "${searchQuery}". Try another search.`
                  : 'No gifts match this selection yet. Try another category.'}
              </p>

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 rounded-full bg-teal-800 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-950"
                >
                  Browse all gifts
                </button>
              )}

            </div>
          )}

        </div>
      )}

    </main>
  )
}

export default Collection

