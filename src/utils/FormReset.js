function formatTimeForInput(val) {
  if (!val) return "";
  // Gérer le format "10:38" directement
  if (val.match(/^([0-9]{1,2}):([0-9]{2})$/)) {
    return val;
  }
  // Gérer l'ancien format "10h38"
  const match = val.match(/^([0-9]{1,2})h([0-9]{2})$/i);
  if (!match) return "";
  const hour = match[1].padStart(2, "0");
  const min = match[2];
  return `${hour}:${min}`;
}

export function formReset(reset, product, metaNow, setGallery, setThumbnail) {
  let delivery_class = '';
  if (product &&
    Array.isArray(product.shipping_classes) &&
    product.shipping_classes.length > 0 &&
    product.shipping_classes[0].term_taxonomy_id) {
    delivery_class = product.shipping_classes[0].term_taxonomy_id;
  }
  reset({
    post_title: product?.post_title || "",
    post_name: product?.post_name || "",
    type:
      product.variations && product.variations.length > 0
        ? "variable"
        : product.post_type,
    post_status: product?.post_status || "",
    total_sales: metaNow?.total_sales || "",
    _tax_status: metaNow?._tax_status || "",
    _tax_class: metaNow?._tax_class || "",
    _manage_stock: metaNow?._manage_stock || "",
    _backorders: metaNow?._backorders || "",
    _sold_individually: metaNow?._sold_individually || "",
    _virtual: metaNow?._virtual === "yes" ? "yes" : "no",
    _downloadable: metaNow?._downloadable || "",
    _download_limit: metaNow?._download_limit || "",
    _download_expiry: metaNow?._download_expiry || "",
    _thumbnail_id: metaNow?._thumbnail_id || "",
    _stock: metaNow?._stock || "",
    stock_status: metaNow?._stock_status || "",
    _wc_average_rating: metaNow?._wc_average_rating || "",
    _wc_review_count: metaNow?._wc_review_count || "",
    _has_additional_costs: metaNow?._has_additional_costs || "",
    _wc_booking_apply_adjacent_buffer: metaNow?._wc_booking_apply_adjacent_buffer === "yes" ? "yes" : "no",
    _wc_booking_availability: metaNow?._wc_booking_availability || [],
    _wc_booking_pricing: metaNow?._wc_booking_pricing || [],
    _wc_booking_block_cost: metaNow?._wc_booking_block_cost || "",
    _wc_booking_buffer_period: metaNow?._wc_booking_buffer_period || "",
    _wc_booking_calendar_display_mode:
      metaNow?._wc_booking_calendar_display_mode || "",
    _wc_booking_cancel_limit_unit: metaNow?._wc_booking_cancel_limit_unit || "",
    _wc_booking_cancel_limit: metaNow?._wc_booking_cancel_limit || "",
    _wc_booking_check_availability_against:
      metaNow?._wc_booking_check_availability_against || "",
    _wc_booking_cost: metaNow?._wc_booking_cost || "",
    _wc_booking_default_date_availability:
      metaNow?._wc_booking_default_date_availability || "",
    _wc_booking_duration_type: metaNow?._wc_booking_duration_type || "",
    _wc_booking_duration_unit: metaNow?._wc_booking_duration_unit || "",
    _wc_booking_duration: metaNow?._wc_booking_duration || "",
    _wc_booking_enable_range_picker: metaNow?._wc_booking_enable_range_picker === "1" ? "1" : "0",
    _wc_booking_requires_confirmation: metaNow?._wc_booking_requires_confirmation === "1" ? "1" : "0",
    _wc_booking_user_can_cancel: metaNow?._wc_booking_user_can_cancel === "1" ? "1" : "0",
    _wc_booking_first_block_time: metaNow?._wc_booking_first_block_time || "",
    _wc_booking_has_person_types:
      metaNow?._wc_booking_has_person_types === "1" ? "1" : "0",
    _wc_booking_has_persons:
      metaNow?._wc_booking_has_persons === "1" ? "1" : "0",
    _wc_booking_has_restricted_days:metaNow?._wc_booking_has_restricted_days === "yes" ? "yes" : "no",
    _wc_booking_restricted_days: metaNow?._wc_booking_restricted_days || {},
    _wc_booking_max_date_unit: metaNow?._wc_booking_max_date_unit || "",
    _wc_booking_max_date: metaNow?._wc_booking_max_date || "",
    _wc_booking_max_duration: metaNow?._wc_booking_max_duration || "",
    _wc_booking_max_persons_group: metaNow?._wc_booking_max_persons_group || "",
    _wc_booking_min_date_unit: metaNow?._wc_booking_min_date_unit || "",
    _wc_booking_min_date: metaNow?._wc_booking_min_date || "",
    _wc_booking_min_duration: metaNow?._wc_booking_min_duration || '',
    _dokan_accommodation_checkin_time: metaNow?._dokan_accommodation_checkin_time || '',
    _dokan_accommodation_checkout_time: metaNow?._dokan_accommodation_checkout_time || '',
    _wc_booking_cancel_limit: metaNow?._wc_booking_cancel_limit || '',
    _wc_booking_cancel_limit_unit: metaNow?._wc_booking_cancel_limit_unit || '',
    _wc_booking_person_cost_multiplier:metaNow?._wc_booking_person_cost_multiplier === "1" ? "1" : "0",
    _wc_booking_person_qty_multiplier:metaNow?._wc_booking_person_qty_multiplier === "1" ? "1" : "0",
    _wc_booking_qty: metaNow?._wc_booking_qty || "",
    _wc_booking_resources_assignment:metaNow?._wc_booking_resources_assignment || "",
    _wc_booking_resource_label: metaNow?._wc_booking_resource_label || "",
    _wc_display_cost: metaNow?._wc_display_cost || "",
    _price: metaNow?._price || "",
    _resource_base_costs: metaNow?._resource_base_costs || "",
    _resource_block_costs: metaNow?._resource_block_costs || "",
    _product_image_gallery: Array.isArray(metaNow?._product_image_gallery)
      ? metaNow._product_image_gallery
      : [],
    _product_attributes: metaNow?._product_attributes || {},
    _product_version: metaNow?._product_version || "",
    chosen_product_cat: metaNow?.chosen_product_cat || [],
    _dokan_new_product_email_sent: metaNow?._dokan_new_product_email_sent || "",
    _dokan_geolocation_use_store_settings:metaNow?._dokan_geolocation_use_store_settings || "",
    dokan_geo_latitude: metaNow?.dokan_geo_latitude || undefined,
    dokan_geo_longitude: metaNow?.dokan_geo_longitude || undefined,
    dokan_geo_address: metaNow?.dokan_geo_address || undefined,
    latitude: metaNow?.dokan_geo_latitude || undefined,
    longitude: metaNow?.dokan_geo_longitude || undefined,
    address: metaNow?.dokan_geo_address || undefined,
    _dokan_is_accommodation_booking:metaNow?._dokan_is_accommodation_booking === "yes" ? "yes" : "no",
    _dokan_accommodation_checkin_time: formatTimeForInput(metaNow?._dokan_accommodation_checkin_time),
    _dokan_accommodation_checkout_time: formatTimeForInput(metaNow?._dokan_accommodation_checkout_time),
    _disable_shipping: metaNow?._disable_shipping || "",
    _overwrite_shipping: metaNow?._overwrite_shipping || "",
    _additional_price: metaNow?._additional_price || "",
    _additional_qty: metaNow?._additional_qty || "",
    _dps_processing_time: metaNow?._dps_processing_time || "",
    _product_addons: metaNow?._product_addons || [],
    _product_addons_exclude_global:metaNow?._product_addons_exclude_global || "",
    ekit_post_views_count: metaNow?.ekit_post_views_count || "",
    _visibility: metaNow?._visibility || "",
    _purchase_note: metaNow?._purchase_note || "",
    _regular_price: metaNow?._regular_price || "",
    _sale_price: metaNow?._sale_price || "",
    _sale_price_dates_from: metaNow?._sale_price_dates_from || "",
    _sale_price_dates_to: metaNow?._sale_price_dates_to || "",
    _sku: metaNow?._sku || "",
    _is_lot_discount: metaNow?._is_lot_discount || "",
    _lot_discount_quantity: metaNow?._lot_discount_quantity || "",
    _lot_discount_amount: metaNow?._lot_discount_amount || "",
    rank_math_analytic_object_id: metaNow?.rank_math_analytic_object_id || "",
    stock_unit: metaNow?._sku || "",
    inventory: metaNow?._stock ? Number(metaNow?._stock).toFixed(0) : "",
    min_inventory: metaNow?._low_stock_amount
      ? Number(metaNow?._low_stock_amount).toFixed(0)
      : "",
    _low_stock_amount: metaNow?._low_stock_amount || "",
    manage_stock: metaNow?._manage_stock === "yes" ? true : false,
    allow_backorders: metaNow?._backorders !== undefined && metaNow?._backorders !== null ? metaNow?._backorders : "no",
    _is_circuit_product: metaNow?._is_circuit_product || "",
    _circuit_type: metaNow?._circuit_type || "",
    _circuit_duree_jour: metaNow?._circuit_duree_jour || "",
    _circuit_duree_nuit: metaNow?._circuit_duree_nuit || "",
    _circuit_price: metaNow?._circuit_price || "",
    _circuit_a_de_remise: metaNow?._circuit_a_de_remise === "yes",
    _circuit_remise_enfants_pourcentage: metaNow?._circuit_remise_enfants_pourcentage || "",
    _circuit_remise_adultes_pourcentage: metaNow?._circuit_remise_adultes_pourcentage || "",
    _circuit_ressources_basic: metaNow?._circuit_ressources_basic || { resources: [] },
    _circuit_ressources_confort: metaNow?._circuit_ressources_confort || { resources: [] },
    _circuit_ressources_premium: metaNow?._circuit_ressources_premium || { resources: [] },
    _circuit_description: product?.post_excerpt || "",
    _circuit_itineraire: product?.post_content || "",
    _circuit_inclus: metaNow?._circuit_inclus || "",
    _circuit_non_inclus: metaNow?._circuit_non_inclus || "",
    _circuit_niveau_basic: metaNow?._circuit_niveau_basic === "yes",
    _circuit_niveau_confort: metaNow?._circuit_niveau_confort === "yes",
    _circuit_niveau_premium: metaNow?._circuit_niveau_premium === "yes",
    _circuit_prix_basic: metaNow?._circuit_prix_basic || "",
    _circuit_prix_confort: metaNow?._circuit_prix_confort || "",
    _circuit_prix_premium: metaNow?._circuit_prix_premium || "",
    etat_tva: metaNow?._tax_status || "instock",
    taux_tva: metaNow?._tax_class || "",
    enable_tva: metaNow?._disable_shipping === "no",
    weight: metaNow?._weight || "",
    seo_description: metaNow?._yoast_wpseo_metadesc || "",
    seo_title: metaNow?._yoast_wpseo_title || "",
    

    length: metaNow?._length || "",
    width: metaNow?._width || "",
    height: metaNow?._height || "",
    delivery_class: delivery_class,
    pageview: metaNow?.pageview || "",
    pharmacie_produit:
      metaNow?.pharmacie_produit || metaNow?.pharmacy_produit || "",
    prescription_required: metaNow?.prescription_required || "",
    _upsell_ids: metaNow?._upsell_ids || [],
    _crosssell_ids: metaNow?._crosssell_ids || [],
    long_description: product?.post_content || "",
    short_description: product?.post_excerpt || "",
    post_author: product?.post_author || "",
    post_date: product?.post_date || "",
    post_modified: product?.post_modified || "",
    comment_status: product?.comment_status || "",
    ping_status: product?.ping_status || "",
    menu_order: product?.menu_order || "",
    variations: product?.variations || [],
    categories: product?.categories?.map((cat) => cat.term_id) || [],
    tags: product?.tags?.map((tag) => tag.term_id) || [],
    guid: product?.guid || "",
    comment_count: product?.comment_count || 0,
    post_content_filtered: product?.post_content_filtered || "",
    post_date_gmt: product?.post_date_gmt || "",
    post_modified_gmt: product?.post_modified_gmt || "",
    post_name: product?.post_name || "",
    post_parent: product?.post_parent || 0,
    post_password: product?.post_password || "",
    post_type: product?.post_type || "",
    post_mime_type: product?.post_mime_type || "",
    to_ping: product?.to_ping || "",
    pinged: product?.pinged || "",
    resources_details: Array.isArray(product?.resources_details)
      ? product.resources_details.map((detail, idx) => ({
        sort_order: idx,
        resource: {
          id: detail.resource.id || detail.resource.ID,
          name: detail.resource.name || detail.resource.post_title,
          base_cost: detail.resource.base_cost ?? "",
          block_cost: detail.resource.block_cost ?? "",
          qty: detail.resource.qty ?? null
        }
      }))
      : [],
    wc_booking_has_resources: metaNow?._wc_booking_has_resources === "1" ? "1" : "0",
    _wc_booking_resource_label: metaNow?._wc_booking_resource_label || "",
    _wc_booking_resources_assignment: metaNow?._wc_booking_resources_assignment || "customer",
    _resource_base_costs: metaNow?._resource_base_costs || {},
    _resource_block_costs: metaNow?._resource_block_costs || {},
  });
  if (setGallery && metaNow._product_image_gallery) {
    setGallery(metaNow._product_image_gallery);
  }
  if (setThumbnail && metaNow._thumbnail_id) {
    setThumbnail(metaNow._thumbnail_id[0] || null);
  }
}
