import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomer } from '../utils/auth'
import { cartEventName, getCart, removeFromCart, updateCartQuantity } from '../utils/cartStore'
import { formatCurrency } from '../utils/format'
import { getBackendUrl } from '../utils/api'

const couponRules = {
  FESTIVE10: 0.1,
  GIFT20: 0.2,
  JOY15: 0.15,
}

const Cart = () => {
  const [items, setItems] = useState(getCart)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    const refresh = () => setItems(getCart())
    window.addEventListener(cartEventName, refresh)
    return () => window.removeEventListener(cartEventName, refresh)
  }, [])

  const subtotal = items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0)
  const shipping = subtotal >= 75 ? 0 : subtotal ? 8 : 0
  const discountRate = appliedCoupon ? couponRules[appliedCoupon] || 0 : 0
  const discountAmount = subtotal * discountRate
  const total = Math.max(0, subtotal + shipping - discountAmount)
  const checkoutPath = getCustomer() ? '/placeorder' : '/login'

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase()
    if (!normalized) {
      setCouponError('Enter a coupon code first.')
      return
    }
    if (!couponRules[normalized]) {
      setCouponError('That coupon code is not valid for this festive sale.')
      return
    }
    setAppliedCoupon(normalized)
    setCouponError('')
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Your selection</p>
      <h1 className="mt-3 font-serif text-4xl text-slate-950">Shopping bag</h1>
      {!items.length ? <div className="mt-10 border border-dashed border-slate-300 px-6 py-16 text-center"><h2 className="font-serif text-2xl">Your bag is waiting</h2><p className="mt-3 text-sm text-slate-500">Add a gift from the collection to begin checkout.</p><Link to="/collection" className="mt-7 inline-block bg-teal-800 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-950">Explore collection</Link></div> : <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]"><div className="divide-y divide-slate-200 border-y border-slate-200">{items.map(({ product, productId, quantity }) => <div className="flex gap-5 py-6" key={productId}><img src={getBackendUrl(product.image[0])} alt={product.name} className="h-32 w-24 object-cover" /><div className="flex flex-1 justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-500">{product.category}</p><h2 className="mt-1 font-medium">{product.name}</h2><div className="mt-3 flex items-center gap-3 text-sm"><label htmlFor={`quantity-${productId}`}>Quantity</label><input id={`quantity-${productId}`} type="number" min="1" max="20" value={quantity} onChange={(event) => updateCartQuantity(productId, Number(event.target.value))} className="w-16 border border-slate-200 px-2 py-1" /><button type="button" onClick={() => removeFromCart(productId)} className="text-teal-800 underline">Remove</button></div></div><p className="font-semibold">{formatCurrency(product.price * quantity)}</p></div></div>)}</div><aside className="h-fit border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div><div className="mt-4 flex justify-between text-slate-500"><span>Shipping</span><span>{shipping ? formatCurrency(shipping) : 'Free'}</span></div><div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-semibold"><span>Total</span><span>{formatCurrency(subtotal + shipping)}</span></div></div><Link to={checkoutPath} className="mt-6 block bg-teal-800 px-5 py-4 text-center text-sm font-semibold text-white hover:bg-teal-950">{getCustomer() ? 'Proceed to checkout' : 'Sign in to checkout'}</Link><Link to="/collection" className="mt-4 block text-center text-sm font-medium text-teal-800 hover:text-teal-950">Continue shopping</Link></aside></div>}
    </main>
  )
}

export default Cart
