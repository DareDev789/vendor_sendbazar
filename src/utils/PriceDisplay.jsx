'use client';

import { useEffect, useState } from "react";
import { formatPrice } from "./formatPrice";

export default function PriceDisplay({ product, selectedVariation, selectedNiveauTour, isProductCard=false }) {
  const isBookable = product.booking;
  const currency = product?.currency || "€";

  const durationType = product?.booking?._wc_booking_duration_type;
  const enableRangePicker = product?.booking?._wc_booking_enable_range_picker === '1';
  const allowRange = enableRangePicker && durationType === 'customer';

  if (isBookable) {
    const basePrice = allowRange
      ? product?.booking?._wc_booking_block_cost
      : product?.booking?._wc_booking_base_cost || product?.booking?._wc_booking_cost || 0;

    console.log(basePrice)

    return (
      <h4 className={isProductCard ? "text-xs text-center" : "text-sm font-semibold text-[#f5848c] mb-4"}>
        À partir de {" "}
        {formatPrice(Number(basePrice ), currency)}
      </h4>
    );
  }

  if (product?.is_circuit) {
    const circuitPrice =
      selectedNiveauTour?.price ??
      product?.circuit_infos?._circuit_prix_basic ??
      product?.circuit_infos?._circuit_prix_confort ??
      product?.circuit_infos?._circuit_prix_premium ??
      0;
    
      console.log(isProductCard);

    return (
      <h4 className={isProductCard ? "text-xs text-center" : "text-sm font-semibold text-[#f5848c] mb-4"}>
        À partir de {formatPrice(circuitPrice, currency)}
      </h4>
    );
  }

  if (product?.productType === "variable" && selectedVariation) {
    return (
      <h4 className={isProductCard ? "text-xs text-center" : "text-sm font-semibold text-[#f5848c] mb-4"}>
        {selectedVariation?.sale_price ? (
          <>
            <span style={{ textDecoration: "line-through" }}>
              {formatPrice(selectedVariation?.regular_price || 0, currency)}
            </span>
            <span className="ml-3">
              - {formatPrice(selectedVariation?.sale_price || 0, currency)}
            </span>
          </>
        ) : (
          formatPrice(selectedVariation?.regular_price || 0, currency)
        )}
      </h4>
    );
  }

  if (product?.productType === "simple") {
    return (
      <h4 className={isProductCard ? "text-xs text-center" : "text-sm font-semibold text-[#f5848c] mb-4"}>
        {product?.salePrice ? (
          <>
            <span style={{ textDecoration: "line-through" }}>
              {formatPrice(product?.regularPrice || 0, currency)}
            </span>
            <span className="ml-3">
              - {formatPrice(product?.salePrice || 0, currency)}
            </span>
          </>
        ) : (
          formatPrice(product?.regularPrice || 0, currency)
        )}
      </h4>
    );
  }

  // Cas : produit à plage de prix
  return (
    <h4 className={isProductCard ? "text-xs text-center" : "text-sm font-semibold text-[#f5848c] mb-4"}>
      {formatPrice(product?.price?.min || 0, currency)}
      {product?.price?.min !== product?.price?.max &&
        ` - ${formatPrice(product?.price?.max || 0, currency)}`}
    </h4>
  );
}