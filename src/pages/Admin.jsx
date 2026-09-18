import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, getBackendUrl, readApiError } from '../utils/api'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'Festival Gifts',
  subCategory: 'Gift Set',
  sizes: 'One size',
  bestseller: false,
}

const getMediaUrl = (url) => {
  if (!url) return ''

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url
  }

  return getBackendUrl(url)
}

const getFirstMedia = (media) => {
  if (Array.isArray(media)) {
    return media[0] || ''
  }

  return media || ''
}

const Admin = () => {
  const [form, setForm] = useState(emptyProduct)

  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null)

  const [video, setVideo] = useState('')
  const [videoFile, setVideoFile] = useState(null)

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [addedProduct, setAddedProduct] = useState(null)

  const [products, setProducts] = useState([])
  const [productCount, setProductCount] = useState(0)

  const [editingProduct, setEditingProduct] = useState(null)

  const [orders, setOrders] = useState([])

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  )

  const avgOrder = orders.length
    ? totalRevenue / orders.length
    : 0

  const statusCounts = orders.reduce((counts, order) => {
    counts[order.status] =
      (counts[order.status] || 0) + 1

    return counts
  }, {})

  const categoryCounts = products.reduce(
    (counts, product) => {
      counts[product.category] =
        (counts[product.category] || 0) + 1

      return counts
    },
    {}
  )

  // =========================================================
  // LOAD PRODUCTS + ORDERS
  // =========================================================

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  const loadProducts = async () => {
    try {
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
      setProductCount(productList.length)
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not load products.'
      )
    }
  }

  const loadOrders = async () => {
    try {
      const response = await apiFetch(
        '/api/admin/orders'
      )

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            'Could not load orders'
          )
        )
      }

      const data = await response.json()

      setOrders(
        Array.isArray(data)
          ? data
          : data.orders || []
      )
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not load orders.'
      )
    }
  }

  // =========================================================
  // FORM
  // =========================================================

  const updateField = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  // =========================================================
  // IMAGE
  // =========================================================

  const handleImage = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(
        'Please choose a valid gift product image.'
      )
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        'Image size must be 5 MB or smaller.'
      )
      event.target.value = ''
      return
    }

    setImageFile(file)
    setError('')
    setSaved(false)

    const reader = new FileReader()

    reader.onload = () => {
      setImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  // =========================================================
  // VIDEO
  // =========================================================

  const handleVideo = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError(
        'Please choose a valid product video.'
      )
      event.target.value = ''
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setError(
        'Video size must be 25 MB or smaller.'
      )
      event.target.value = ''
      return
    }

    setVideoFile(file)
    setError('')
    setSaved(false)

    const reader = new FileReader()

    reader.onload = () => {
      setVideo(reader.result)
    }

    reader.readAsDataURL(file)
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm(emptyProduct)

    setImage('')
    setImageFile(null)

    setVideo('')
    setVideoFile(null)

    setEditingProduct(null)
    setSaved(false)
    setAddedProduct(null)
    setError('')
  }

  // =========================================================
  // ADD / EDIT PRODUCT
  // =========================================================

  const addProduct = async (event) => {
    event.preventDefault()

    setSaved(false)
    setAddedProduct(null)
    setError('')

    try {
      // Image is required only when creating
      if (!editingProduct && !imageFile) {
        setError(
          'Product image is required.'
        )
        return
      }

      const payload = new FormData()

      payload.append(
        'name',
        String(form.name || '')
      )

      payload.append(
        'description',
        String(form.description || '')
      )

      payload.append(
        'price',
        String(form.price || '')
      )

      payload.append(
        'category',
        String(form.category || '')
      )

      payload.append(
        'subCategory',
        String(form.subCategory || '')
      )

      payload.append(
        'sizes',
        String(form.sizes || 'One size')
      )

      payload.append(
        'bestseller',
        String(Boolean(form.bestseller))
      )

      if (imageFile) {
        payload.append(
          'image',
          imageFile
        )
      }

      if (videoFile) {
        payload.append(
          'video',
          videoFile
        )
      }

      const isEditing =
        Boolean(editingProduct)

      const url = isEditing
        ? `/api/products/${editingProduct._id}`
        : '/api/products'

      const response = await apiFetch(
        url,
        {
          method: isEditing
            ? 'PUT'
            : 'POST',
          body: payload,
        }
      )

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            isEditing
              ? 'Could not update the product'
              : 'Could not add the product'
          )
        )
      }

      const savedProduct =
        await response.json()

      // =====================================================
      // UPDATE PRODUCTS STATE
      // =====================================================

      if (isEditing) {
        setProducts((current) =>
          current.map((product) =>
            product._id ===
            savedProduct._id
              ? savedProduct
              : product
          )
        )
      } else {
        setProducts((current) => [
          savedProduct,
          ...current,
        ])

        setProductCount(
          (count) => count + 1
        )
      }

      setAddedProduct(savedProduct)

      setForm(emptyProduct)

      setImage('')
      setImageFile(null)

      setVideo('')
      setVideoFile(null)

      setEditingProduct(null)

      setSaved(true)
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not connect to the backend.'
      )
    }
  }

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const editProduct = (product) => {
    setEditingProduct(product)

    setForm({
      ...emptyProduct,
      ...product,

      sizes: Array.isArray(
        product.sizes
      )
        ? product.sizes.join(', ')
        : product.sizes ||
          'One size',

      bestseller:
        Boolean(product.bestseller),
    })

    const existingImage =
      getFirstMedia(product.image)

    const existingVideo =
      getFirstMedia(product.video)

    setImage(
      existingImage
        ? getMediaUrl(existingImage)
        : ''
    )

    setVideo(
      existingVideo
        ? getMediaUrl(existingVideo)
        : ''
    )

    setImageFile(null)
    setVideoFile(null)

    setSaved(false)
    setAddedProduct(null)
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (product) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      )

    if (!confirmed) return

    setError('')

    try {
      if (!product._id) {
        throw new Error(
          'Product ID is missing.'
        )
      }

      const response = await apiFetch(
        `/api/products/${product._id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            'Could not delete the product'
          )
        )
      }

      // Backend returns 204.
      // Therefore do NOT call response.json().

      setProducts((current) =>
        current.filter(
          (item) =>
            item._id !== product._id
        )
      )

      setProductCount((count) =>
        Math.max(0, count - 1)
      )

      if (
        editingProduct &&
        editingProduct._id ===
          product._id
      ) {
        resetForm()
      }
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not delete the product.'
      )
    }
  }

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const cancelEditing = () => {
    resetForm()
  }

  // =========================================================
  // ORDER STATUS
  // =========================================================

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      setError('')

      const response =
        await apiFetch(
          `/api/admin/orders/${orderId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              status,
            }),
          }
        )

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            'Could not update order status'
          )
        )
      }

      const result =
        await response.json()

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? result.order
            : order
        )
      )
    } catch (requestError) {
      setError(
        requestError.message ||
          'Could not update order status.'
      )
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Store management
          </p>

          <h1 className="mt-3 font-serif text-4xl text-slate-950">
            {editingProduct
              ? 'Edit gift product'
              : 'Add a gift product'}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Create and manage products for the
            Vaishnora Kraft festival gift collection.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          {productCount} products in store
        </div>
      </div>

      {/* DASHBOARD */}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <div className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Revenue
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-slate-950">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Gross sales from all orders
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Orders
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-slate-950">
            {orders.length}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Customer purchases in queue
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Average order
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-slate-950">
            ₹{avgOrder.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Typical cart value per order
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Catalog
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-slate-950">
            {productCount}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Products currently live in the store
          </p>
        </div>

      </div>

      {/* SALES / ORDER STATUS */}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

        <div className="border border-slate-200 bg-white p-6">

          <h2 className="font-serif text-2xl text-slate-950">
            Products by category
          </h2>

          <div className="mt-5 space-y-4">

            {Object.entries(categoryCounts).length ? (
              Object.entries(categoryCounts).map(
                ([category, count]) => (
                  <div key={category}>

                    <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                      <span>{category}</span>
                      <span>{count} items</span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">

                      <div
                        className="h-2 rounded-full bg-teal-700"
                        style={{
                          width: `${Math.min(
                            (count /
                              Math.max(
                                ...Object.values(
                                  categoryCounts
                                ),
                                1
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No product categories yet.
              </p>
            )}

          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6">

          <h2 className="font-serif text-2xl text-slate-950">
            Order status
          </h2>

          <div className="mt-5 space-y-3">

            {Object.entries(statusCounts).length ? (
              Object.entries(statusCounts).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                  >
                    <span className="capitalize text-slate-600">
                      {status}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {count}
                    </span>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No orders yet.
              </p>
            )}

          </div>
        </div>

      </div>

      {/* PRODUCT FORM */}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">

        <form
          onSubmit={addProduct}
          className="space-y-6 border border-slate-200 bg-white p-6 sm:p-8"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            {/* NAME */}

            <label className="text-sm font-medium sm:col-span-2">
              Product name

              <input
                required
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Example: Diwali Celebration Gift Box"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

            {/* PRICE */}

            <label className="text-sm font-medium">
              Price

              <input
                required
                min="0"
                step="0.01"
                type="number"
                name="price"
                value={form.price}
                onChange={updateField}
                placeholder="799"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

            {/* CATEGORY */}

            <label className="text-sm font-medium">
              Occasion

              <select
                name="category"
                value={form.category}
                onChange={updateField}
                className="mt-2 w-full border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-teal-700"
              >
                <option>Festival Gifts</option>
                <option>Birthday Gifts</option>
                <option>Wedding Gifts</option>
                <option>Anniversary Gifts</option>
                <option>Decorative Ideas</option>
                <option>For Kids</option>
              </select>
            </label>

            {/* SUBCATEGORY */}

            <label className="text-sm font-medium">
              Gift type

              <input
                required
                name="subCategory"
                value={form.subCategory}
                onChange={updateField}
                placeholder="Gift Set"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

            {/* SIZES */}

            <label className="text-sm font-medium">
              Options

              <input
                name="sizes"
                value={form.sizes}
                onChange={updateField}
                placeholder="One size, Small, Large"
                className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
              />
            </label>

          </div>

          {/* DESCRIPTION */}

          <label className="block text-sm font-medium">
            Description

            <textarea
              required
              name="description"
              value={form.description}
              onChange={updateField}
              rows="5"
              placeholder="Describe what makes this gift special..."
              className="mt-2 w-full resize-none border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700"
            />
          </label>

          {/* IMAGE */}

          <label className="block text-sm font-medium">
            Gift product image

            <input
              required={!editingProduct}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImage}
              className="mt-2 block w-full border border-dashed border-slate-300 p-4 text-sm text-slate-500"
            />
          </label>

          {image && (
            <div className="flex items-center gap-4 rounded border border-teal-100 bg-teal-50 p-3">

              <img
                src={image}
                alt="Selected gift preview"
                className="h-20 w-20 object-cover"
              />

              <p className="text-sm text-teal-900">
                Gift image ready
              </p>

            </div>
          )}

          {/* VIDEO */}

          <label className="block text-sm font-medium">

            Product video{' '}

            <span className="font-normal text-slate-500">
              (optional)
            </span>

            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideo}
              className="mt-2 block w-full border border-dashed border-slate-300 p-4 text-sm text-slate-500"
            />

          </label>

          {video && (
            <video
              src={video}
              controls
              muted
              className="max-h-56 w-full bg-slate-950 object-contain"
            />
          )}

          {/* BESTSELLER */}

          <label className="flex items-center gap-3 text-sm font-medium">

            <input
              type="checkbox"
              name="bestseller"
              checked={Boolean(
                form.bestseller
              )}
              onChange={updateField}
              className="h-4 w-4 accent-teal-800"
            />

            Show as a featured gift

          </label>

          {/* SUBMIT */}

          <button
            type="submit"
            className="w-full bg-teal-800 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-teal-950"
          >
            {editingProduct
              ? 'Save product changes'
              : 'Add product to store'}
          </button>

          {/* CANCEL */}

          {editingProduct && (
            <button
              type="button"
              onClick={cancelEditing}
              className="w-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Cancel editing
            </button>
          )}

          {/* SUCCESS */}

          {saved && addedProduct && (
            <div
              role="status"
              className="flex items-center gap-4 border border-teal-200 bg-teal-50 p-3"
            >

              <img
                src={getMediaUrl(
                  getFirstMedia(
                    addedProduct.image
                  )
                )}
                alt={`${addedProduct.name} preview`}
                className="h-16 w-16 object-cover"
              />

              <div>

                <p className="text-sm font-semibold text-teal-900">
                  Product saved successfully.
                </p>

                <p className="mt-1 text-xs text-teal-800">
                  The product is stored in the server database.
                </p>

              </div>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <p
              role="alert"
              className="text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

        </form>

        {/* MEDIA GUIDE */}

        <aside className="h-fit border border-slate-200 bg-slate-50 p-6">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Gift media guide
          </p>

          <h2 className="mt-3 font-serif text-2xl">
            Show the feeling
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Upload a bright product image and an
            optional short MP4, WebM, or MOV video.
            Images support 5 MB; videos support 25 MB.
          </p>

          <Link
            to="/collection"
            className="mt-6 inline-block text-sm font-semibold text-teal-800 hover:text-teal-950"
          >
            View collection →
          </Link>

        </aside>

      </div>

      {/* MANAGE PRODUCTS */}

      <section className="mt-12 border-t border-slate-200 pt-10">

        <h2 className="font-serif text-3xl text-slate-950">
          Manage products
        </h2>

        {products.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No products found in database.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => {

              const productImage =
                getMediaUrl(
                  getFirstMedia(
                    product.image
                  )
                )

              const productVideo =
                getMediaUrl(
                  getFirstMedia(
                    product.video
                  )
                )

              return (
                <article
                  key={product._id}
                  className="border border-slate-200 bg-white p-4"
                >

                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
                      No image
                    </div>
                  )}

                  <h3 className="mt-3 font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString('en-IN')}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {product.category}
                  </p>

                  {productVideo && (
                    <p className="mt-2 text-xs font-medium text-teal-700">
                      ✓ Product video uploaded
                    </p>
                  )}

                  <div className="mt-4 flex gap-3 text-sm">

                    <button
                      type="button"
                      onClick={() =>
                        editProduct(product)
                      }
                      className="font-semibold text-teal-800 underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteProduct(product)
                      }
                      className="font-semibold text-red-700 underline"
                    >
                      Delete
                    </button>

                  </div>

                </article>
              )
            })}

          </div>
        )}

      </section>

      {/* ORDERS */}

      <section className="mt-12 border-t border-slate-200 pt-10">

        <h2 className="font-serif text-3xl text-slate-950">
          Customer orders
        </h2>

        <div className="mt-6 space-y-4">

          {orders.length ? (

            orders.map((order) => (

              <article
                key={order._id}
                className="border border-slate-200 bg-white p-5"
              >

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>

                    <h3 className="font-semibold">
                      Order #
                      {String(
                        order._id || ''
                      ).slice(-8)}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">

                      {order.address?.firstName || ''}
                      {' '}

                      {order.address?.lastName || ''}

                      {order.address?.email
                        ? ` · ${order.address.email}`
                        : ''}

                    </p>

                  </div>

                  <select
                    value={
                      order.status ||
                      'placed'
                    }
                    onChange={(event) =>
                      updateOrderStatus(
                        order._id,
                        event.target.value
                      )
                    }
                    className="border border-slate-200 px-3 py-2 text-sm capitalize"
                  >

                    <option value="placed">
                      Placed
                    </option>

                    <option value="confirmed">
                      Confirmed
                    </option>

                    <option value="processing">
                      Processing
                    </option>

                    <option value="shipped">
                      Shipped
                    </option>

                    <option value="delivered">
                      Delivered
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                <p className="mt-3 text-sm text-slate-600">

                  {Array.isArray(
                    order.items
                  )
                    ? order.items
                        .map(
                          (item) =>
                            `${item.name} x ${item.quantity}`
                        )
                        .join(', ')
                    : 'No items'}

                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Total: ₹
                  {Number(
                    order.total || 0
                  ).toLocaleString('en-IN')}
                </p>

              </article>

            ))

          ) : (

            <p className="text-sm text-slate-500">
              No customer orders yet.
            </p>

          )}

        </div>

      </section>

    </main>
  )
}

export default Admin
