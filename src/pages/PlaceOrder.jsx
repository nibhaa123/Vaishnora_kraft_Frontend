import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCustomer } from '../utils/auth'
import { apiFetch, readApiError } from '../utils/api'
import { clearCart, getCart } from '../utils/cartStore'
import { formatCurrency } from '../utils/format'

const PlaceOrder = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const items = getCart()
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const shipping = subtotal >= 75 ? 0 : subtotal ? 8 : 0
  if (!getCustomer()) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!items.length) return <Navigate to="/cart" replace />

  const placeOrder = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const address = Object.fromEntries(form.entries())
    try {
      const response = await apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })) }) })
      if (!response.ok) throw new Error(await readApiError(response, 'Could not place your order'))
      clearCart()
      navigate('/orders', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Almost there</p>
      <h1 className="mt-3 font-serif text-4xl text-slate-950">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={placeOrder} className="space-y-5 border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Delivery details</h2>
          <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">First name<input required name="firstName" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label><label className="text-sm font-medium">Last name<input required name="lastName" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label></div>
          <label className="block text-sm font-medium">Email address<input required name="email" type="email" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label>
          <label className="block text-sm font-medium">Address<input required name="address" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label>
          <div className="grid gap-5 sm:grid-cols-3"><label className="text-sm font-medium">City<input required name="city" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label><label className="text-sm font-medium">State<input required name="state" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label><label className="text-sm font-medium">PIN code<input required name="pinCode" className="mt-2 w-full border border-slate-200 px-4 py-3 font-normal outline-none focus:border-teal-700" /></label></div>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={isSubmitting} type="submit" className="w-full bg-teal-800 px-5 py-4 text-sm font-semibold text-white hover:bg-teal-950 disabled:opacity-60">{isSubmitting ? 'Placing order...' : 'Place order'}</button>
        </form>
        <aside className="h-fit border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-6 flex justify-between border-b border-slate-200 pb-4 text-sm text-slate-500"><span>{items.reduce((total, item) => total + item.quantity, 0)} items</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-4 flex justify-between text-sm text-slate-500"><span>Shipping</span><span>{shipping ? formatCurrency(shipping) : 'Free'}</span></div><div className="mt-4 flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(subtotal + shipping)}</span></div><p className="mt-5 text-xs leading-5 text-slate-500">Free home delivery available within 4–5 km.</p><Link to="/collection" className="mt-6 block text-center text-sm font-medium text-teal-800 hover:text-teal-950">Continue shopping</Link></aside>
      </div>
    </main>
  )
}

export default PlaceOrder
