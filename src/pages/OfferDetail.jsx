import React from 'react'
import OfferDetailsFull from '../components/offerDetails/offerdetails'

const OfferDetail = () => {
  return (
    <div className='p-6 md:ml-72 max-w-7xl mx-auto'>

              <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-center mb-12  text-gray-900 drop-shadow-md tracking-tight">
        🛒 Offer Details
      </h1>
        <OfferDetailsFull/>
    </div>
  )
}

export default OfferDetail