import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProducts } from '../utils/productStore'
import { getCustomer } from '../utils/auth'
import { formatCurrency } from '../utils/format'
import { addToCart } from '../utils/cartStore'
import { isWishlisted, toggleWishlist } from '../utils/wishlistStore'
import { apiFetch, getBackendUrl } from '../utils/api'

const Product = () => {
  const { id } = useParams()
  const products = getProducts()
  const [product, setProduct] = useState(
    () => products.find((item) => item._id === id) || products[0]
  )
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [isFavorite, setIsFavorite] = useState(isWishlisted(product._id))

  useEffect(() => {
    let isCurrent = true

    apiFetch(`/api/products/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Product is unavailable.')
        return response.json()
      })
      .then((result) => {
        if (isCurrent) setProduct(result)
      })
      .catch(() => {
        // Keep the locally cached product available if the API is offline.
      })

    return () => { isCurrent = false }
  }, [id])

  useEffect(() => {
    setIsFavorite(isWishlisted(product._id))

    let isCurrent = true
    apiFetch(`/api/products/${product._id}/reviews`)
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Reviews are temporarily unavailable.')
        return result
      })
      .then((result) => {
        if (isCurrent) setReviews(Array.isArray(result) ? result : [])
      })
      .catch((error) => {
        if (isCurrent) setReviewError(error.message)
      })
    return () => { isCurrent = false }
  }, [product._id])

  const submitReview = async (event) => {
    event.preventDefault()
    const customer = getCustomer()
    if (!customer) {
      setReviewError('Please sign in before adding a review.')
      return
    }
    setIsSubmittingReview(true)
    setReviewError('')
    try {
      const response = await apiFetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customer.id, customerName: customer.name, rating, comment }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not add review')
      setReviews((currentReviews) => [result, ...currentReviews])
      setComment('')
    } catch (error) {
      setReviewError(error.message)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const averageRating = reviews.length ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1) : 'New'
  const handleAddToCart = () => {
    addToCart(product)
    setCartMessage('Added to your gift bag.')
  }

  const handleWishlistTap = () => {
    const nextWishlist = toggleWishlist(product._id)
    setIsFavorite(nextWishlist.includes(product._id))
  }

  const whatsappMessage = encodeURIComponent(`Hi Vaishnora Kraft, I want to order ${product.name} for ₹${product.price}. Please share availability and delivery details.`)

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
      <Link to="/collection" className="text-sm font-medium text-teal-800 hover:text-teal-950">&lt;- Back to collection</Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-slate-100"><img src={getBackendUrl(product.image[0])} alt={product.name} className="h-full w-full object-cover" /></div>
          {product.video?.[0] && <div className="overflow-hidden bg-slate-950"><video src={getBackendUrl(product.video[0])} controls muted playsInline className="max-h-[420px] w-full object-contain" /></div>}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{product.category} / {product.subCategory}</p>
          <h1 className="mt-4 font-serif text-4xl text-slate-950 sm:text-5xl">{product.name}</h1>
          <p className="mt-5 text-2xl font-semibold">{formatCurrency(product.price)}</p>
          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-500">{product.description}</p>
          <div className="mt-8 border-y border-slate-200 py-5">
            <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="h-4 w-4 accent-teal-800" />Add premium gift wrapping</label>
            <p className="mt-2 pl-7 text-xs text-slate-500">Ready to present at the door.</p>
            <label className="mt-4 block text-sm font-medium">Personal gift message <span className="font-normal text-slate-400">(optional)</span><textarea value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} maxLength="120" rows="2" placeholder="Write a thoughtful note..." className="mt-2 w-full resize-none border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-teal-700" /></label>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleAddToCart} className="w-full bg-teal-800 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-teal-950 sm:w-auto">Add to gift bag</button>
            <button type="button" onClick={handleWishlistTap} className="w-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-700 hover:text-teal-800 sm:w-auto">
              {isFavorite ? '♥ Saved' : '♡ Save for later'}
            </button>
          </div>
          <a href={`https://wa.me/917991157761?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 sm:w-auto">
            Order on WhatsApp
          </a>
          {cartMessage && <p role="status" className="mt-3 text-sm text-teal-800">{cartMessage}</p>}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500"><p>Gift wrapping available</p><p>Secure checkout</p></div>
        </div>
      </div>
      <section className="mt-20 border-t border-slate-200 pt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Customer voices</p><h2 className="mt-2 font-serif text-3xl text-slate-950">Reviews <span className="text-base font-sans text-slate-500">{averageRating} {reviews.length ? `(${reviews.length})` : ''}</span></h2></div><p className="text-sm text-slate-500">Share your experience with this gift.</p></div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">{reviews.length ? reviews.map((review) => <article key={review.id} className="border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-4"><p className="font-semibold text-slate-950">{review.customerName}</p><span className="text-sm tracking-widest text-amber-500">{'★'.repeat(review.rating)}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p></article>) : <p className="border border-dashed border-slate-300 p-6 text-sm text-slate-500">Be the first to review this product.</p>}</div>
          <form onSubmit={submitReview} className="border border-slate-200 bg-white p-6"><h3 className="font-serif text-2xl text-slate-950">Write a review</h3><label className="mt-5 block text-sm font-medium">Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-2 w-full border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-700"><option value="5">5 stars - Excellent</option><option value="4">4 stars - Great</option><option value="3">3 stars - Good</option><option value="2">2 stars - Fair</option><option value="1">1 star - Poor</option></select></label><label className="mt-5 block text-sm font-medium">Comment<textarea required minLength="5" maxLength="500" value={comment} onChange={(event) => setComment(event.target.value)} rows="5" placeholder="What did you think?" className="mt-2 w-full resize-none border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-teal-700" /></label>{reviewError && <p role="alert" className="mt-3 text-sm text-red-700">{reviewError}</p>}<button disabled={isSubmittingReview} type="submit" className="mt-5 w-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-950 disabled:cursor-wait disabled:opacity-60">{isSubmittingReview ? 'Posting...' : 'Post review'}</button></form>
        </div>
      </section>
    </main>
  )
}

export default Product
