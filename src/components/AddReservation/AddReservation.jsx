import { useEffect, useRef, useState } from "react";
import ImageGallery from "../../utils/ImageGallery";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "../../contextes/helpers";
import axios from "axios";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import EditorComp from "../../utils/EditorComp";
import LivraisonEtTva from "../../utils/LivraisonEtTva";
import CategorieComp from "../../utils/CategorieComp";
import InventairesComp from "../../utils/InventairesComp";
import SeoComp from "../../utils/SeoComp";
import DisponibiliteComp from "../../utils/DisponibiliteComp";
import TarifsComp from "../../utils/TarifsComp";
import MotCleComp from "../../utils/MotCleComp";
import { url } from "../../contextes/UrlContext";
import { url_frontend } from "../../contextes/UrlContext";
import GeolocalisationComp from "../../utils/GeolocalisationComp";
import { formReset } from "../../utils/FormReset";
import ResourceAddComp from "../../utils/ResourceAddComp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import RubriqueProduct from "../../utils/RubriqueProduct";
import { useDevise } from "../../contextes/DeviseContext";
import Tooltip from "../../utils/Tooltip";

export default function AddReservation() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({});
  const [gallery, setGallery] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [postStatus, setPostStatus] = useState("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categorieSelected, setCategorieSelected] = useState([]);
  const [isAccommodation, setIsAccommodation] = useState(false);
  const [isVirtuel, setIsVirtuel] = useState(false);
  const shortDescriptionEditorRef = useRef(null);
  const longDescriptionEditorRef = useRef(null);
  const [linkProduct, setLinkProduct] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const name = watch("post_title");
  const slug = watch("post_name");
  const [tagsChoosed, setTagsChoosed] = useState([]);
  const [product, setProduct] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const [autresLocalisations, setAutresLocalisations] = useState([]);
  const { devise, listDevise } = useDevise();
  
  // Écouter les changements de devise pour éviter le rechargement de page
  useEffect(() => {
    const handleDeviseChange = (event) => {
      const { newDevise, oldDevise } = event.detail;
      console.log(`Devise changée de ${oldDevise} vers ${newDevise}`);
      // Ici on peut ajouter une logique pour convertir les prix si nécessaire
      // Pour l'instant, on laisse juste les champs se mettre à jour automatiquement
    };

    window.addEventListener('deviseChanged', handleDeviseChange);
    
    return () => {
      window.removeEventListener('deviseChanged', handleDeviseChange);
    };
  }, []);

  const removeImage = (id) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
  };
  const fectOneProductToPut = async () => {
    try {
      nProgress.start();
      const response = await axios.get(`${url}/products/getOneProduct/${id}?devise=${devise}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const product = response.data.product;
      if (!product || !product.metaNow) {
        return;
      }
      setProduct(product);
      setAutresLocalisations(product?.autresLocalisations || []);
      const metaNow = product.metaNow;

      formReset(reset, product, metaNow, setGallery, setThumbnail);
      const termIds = product?.categories.map((cat) => cat.term_id);
      setCategorieSelected(termIds);
      const tagsChoosed = product?.tags?.map((cat) => ({
        id: cat.term_id,
        name: cat.name,
      }));
      setTagsChoosed(tagsChoosed);
      if (product.post_status) setPostStatus(product.post_status);
      setIsAccommodation(metaNow?._dokan_is_accommodation_booking === "yes");
      setValue(
        "_dokan_is_accommodation_booking",
        metaNow?._dokan_is_accommodation_booking === "yes" ? "yes" : "no"
      );
      setIsVirtuel(metaNow?._virtual === "yes");
      setValue("virtuel", metaNow?._virtual === "yes");
      setValue("rubrique", product?.metaNow?.rubrique || "");
    } catch (error) {
    } finally {
      nProgress.done();
    }
  };
  useEffect(() => {
    if (product && product.metaNow) {
      setThumbnail(product.metaNow._thumbnail_id?.[0] || null);
      if (product.metaNow._dokan_accommodation_checkin_time) {
        setValue(
          "_dokan_accommodation_checkin_time",
          product.metaNow._dokan_accommodation_checkin_time
        );
      }
      if (product.metaNow._dokan_accommodation_checkout_time) {
        setValue(
          "_dokan_accommodation_checkout_time",
          product.metaNow._dokan_accommodation_checkout_time
        );
      }
      if (
        product.metaNow._wc_booking_min_date !== undefined &&
        product.metaNow._wc_booking_min_date !== null
      ) {
        setValue("_wc_booking_min_date", product.metaNow._wc_booking_min_date);
      }
      if (
        product.metaNow._wc_booking_max_date !== undefined &&
        product.metaNow._wc_booking_max_date !== null
      ) {
        setValue("_wc_booking_max_date", product.metaNow._wc_booking_max_date);
      }
      setIsVirtuel(product.metaNow._virtual === "yes");
      setValue("virtuel", product.metaNow._virtual === "yes");

      const isAccommodationBooking =
        product.metaNow._dokan_is_accommodation_booking === "yes";
      if (isAccommodationBooking) {
        setValue(
          "_wc_booking_min_duration_accommodation",
          product.metaNow._wc_booking_min_duration || ""
        );
        setValue(
          "_wc_booking_max_duration_accommodation",
          product.metaNow._wc_booking_max_duration || ""
        );
        setValue("_wc_booking_min_duration_non_accommodation", "");
        setValue("_wc_booking_max_duration_non_accommodation", "");
      } else {
        setValue(
          "_wc_booking_min_duration_non_accommodation",
          product.metaNow._wc_booking_min_duration || ""
        );
        setValue(
          "_wc_booking_max_duration_non_accommodation",
          product.metaNow._wc_booking_max_duration || ""
        );
        setValue("_wc_booking_min_duration_accommodation", "");
        setValue("_wc_booking_max_duration_accommodation", "");
      }
    }
  }, [product, setValue]);
  useEffect(() => {
    if (id) {
      fectOneProductToPut();
    }
  }, [id]);
  useEffect(() => {
    if (name) {
      setValue("post_name", slugify(name));
    }
    if (slug && slug?.trim() !== "") {
      setLinkProduct(`${url_frontend}/produit/${slug}`);
      setShowLink(true);
    } else {
      setLinkProduct("");
      setShowLink(false);
    }
  }, [name, slug, setValue]);
  useEffect(() => {
    setValue("_dokan_is_accommodation_booking", isAccommodation ? "yes" : "no");
    if (!isAccommodation) {
      setValue("_dokan_accommodation_checkin_time", "");
      setValue("_dokan_accommodation_checkout_time", "");
      setValue("_wc_booking_min_duration_accommodation", "");
      setValue("_wc_booking_max_duration_accommodation", "");
    } else {
      setValue("_wc_booking_min_duration_non_accommodation", "");
      setValue("_wc_booking_max_duration_non_accommodation", "");
      setValue("_wc_booking_duration_type", "");
      setValue("_wc_booking_duration", "");
      setValue("_wc_booking_duration_unit", "");
    }
  }, [isAccommodation, setValue]);
  useEffect(() => {
    const canCancel = watch("_wc_booking_user_can_cancel") === "1";
    if (!canCancel) {
      setValue("_wc_booking_cancel_limit", "");
      setValue("_wc_booking_cancel_limit_unit", "");
    }
  }, [watch("_wc_booking_user_can_cancel"), setValue]);
  useEffect(() => {
    const hasRestrictedDays = watch("_wc_booking_has_restricted_days");
    if (!hasRestrictedDays || hasRestrictedDays === "no") {
      const days = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ];
      days.forEach((day) => {
        setValue(`_wc_booking_restricted_days.${day}`, false);
      });
      setValue("_wc_booking_restricted_days", {});
    }
  }, [watch("_wc_booking_has_restricted_days"), setValue]);
  useEffect(() => {
    if (!id) {
      setValue("resources_details", []);
      setValue("_wc_booking_resource_label", "");
      setValue("_wc_booking_resources_assignment", "customer");
      setValue("_resource_base_costs", {});
      setValue("_resource_block_costs", {});
      setValue("_wc_booking_enable_range_picker", "0");
      setValue("_wc_booking_requires_confirmation", "0");
      setValue("_wc_booking_user_can_cancel", "0");
      setValue("wc_booking_has_resources", "0");
    }
  }, [id, setValue]);

  useEffect(() => {
    const manageStock = watch("manage_stock");
    if (!manageStock) {
      setValue("inventory", "");
      setValue("min_inventory", "");
      setValue("allow_backorders", "no");
    }
  }, [watch("manage_stock"), setValue]);
  useEffect(() => {
    setIsVirtuel(!!watch("virtuel"));
  }, [watch("virtuel")]);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);
    nProgress.start();
    try {
      if (shortDescriptionEditorRef.current) {
        data.short_description = shortDescriptionEditorRef.current.getData();
      }
      if (longDescriptionEditorRef.current) {
        data.long_description = longDescriptionEditorRef.current.getData();
      }
      if (typeof data._price === 'string') data._price = data._price.replace(',', '.');
      if (typeof data._regular_price === 'string') data._regular_price = data._regular_price.replace(',', '.');
      if (typeof data._sale_price === 'string') data._sale_price = data._sale_price.replace(',', '.');
      if (typeof data._additional_price === 'string') data._additional_price = data._additional_price.replace(',', '.');
      if (typeof data._lot_discount_amount === 'string') data._lot_discount_amount = data._lot_discount_amount.replace(',', '.');
      
      if (!isAccommodation) {
        data._dokan_accommodation_checkin_time = "";
        data._dokan_accommodation_checkout_time = "";
        // Utiliser les valeurs spécifiques à l'hébergement
        data._wc_booking_min_duration =
          data._wc_booking_min_duration_non_accommodation || "";
        data._wc_booking_max_duration =
          data._wc_booking_max_duration_non_accommodation || "";
        data._dokan_is_accommodation_booking = "no";
      } else {
        data._wc_booking_min_duration =
          data._wc_booking_min_duration_accommodation || "";
        data._wc_booking_max_duration =
          data._wc_booking_max_duration_accommodation || "";
      }

      if (data._wc_booking_user_can_cancel !== "1") {
        data._wc_booking_cancel_limit = "";
        data._wc_booking_cancel_limit_unit = "";
      }
      if (
        !data._wc_booking_has_restricted_days ||
        data._wc_booking_has_restricted_days === "no"
      ) {
        data._wc_booking_restricted_days = {};
      }

      const resources_details = data.resources_details || [];

      const metaNow = {
        _thumbnail_id: thumbnail ? [thumbnail] : [],
        _product_image_gallery: gallery,
        categorieSelected,
        tags: tagsChoosed,
        dokan_geo_latitude: data.latitude || "",
        dokan_geo_longitude: data.longitude || "",
        dokan_geo_address: data.address || "",
        _wc_booking_user_can_cancel:
          data._wc_booking_user_can_cancel === "1" ? "1" : "0",
        _dokan_accommodation_checkin_time:
          data._dokan_accommodation_checkin_time || "",
        _dokan_accommodation_checkout_time:
          data._dokan_accommodation_checkout_time || "",
        _dokan_is_accommodation_booking: isAccommodation ? "yes" : "no",
        _price: data._price || "",
        _regular_price: data._regular_price || "",
        _sale_price: data._sale_price || "",
        _sale_price_dates_from: data._sale_price_dates_from || "",
        _sale_price_dates_to: data._sale_price_dates_to || "",
        _additional_price: data._additional_price || "",
        _additional_qty: data._additional_qty || "",
        _tax_status: data.etat_tva || "",
        _tax_class: data.taux_tva || "",
        etat_tva: data.etat_tva || "",
        taux_tva: data.taux_tva || "",
        enable_tva: data.enable_tva || false,
        _stock: data.inventory || "",
        _low_stock_amount: data.min_inventory || "",
        _stock_status: data.stock_status || "",
        _manage_stock: data.manage_stock ? "yes" : "no",
        _backorders:
          data.allow_backorders !== undefined ? data.allow_backorders : "",
        _sold_individually: data._sold_individually || "",
        _sku: data.stock_unit || "",
        stock_unit: data.stock_unit || "",
        inventory: data.inventory || "",
        min_inventory: data.min_inventory || "",
        _virtual: data.virtuel ? "yes" : "no",
        _wc_booking_apply_adjacent_buffer:
          data._wc_booking_apply_adjacent_buffer ? "yes" : "no",
        _wc_booking_block_cost: data._wc_booking_block_cost || "",
        _wc_booking_buffer_period: data._wc_booking_buffer_period || "",
        _wc_booking_calendar_display_mode:
          data._wc_booking_calendar_display_mode || "",
        _wc_booking_check_availability_against:
          data._wc_booking_check_availability_against || "",
        _wc_booking_cost: data._wc_booking_cost || "",
        _wc_booking_default_date_availability:
          data._wc_booking_default_date_availability || "",
        _wc_booking_duration: data._wc_booking_duration || "",
        _wc_booking_duration_type: data._wc_booking_duration_type || "",
        _wc_booking_duration_unit: data._wc_booking_duration_unit || "",
        _wc_booking_enable_range_picker:
          data._wc_booking_enable_range_picker === "1" ? "1" : "0",
        _wc_booking_first_block_time: data._wc_booking_first_block_time || "",
        _wc_booking_has_person_types: data._wc_booking_has_person_types
          ? "yes"
          : "no",
        _wc_booking_has_persons: data._wc_booking_has_persons ? "1" : "0",
        _wc_booking_has_resources:
          data.wc_booking_has_resources === "1" ? "1" : "0",
        _wc_booking_has_restricted_days:
          data._wc_booking_has_restricted_days === true ||
          data._wc_booking_has_restricted_days === "yes" ||
          data._wc_booking_has_restricted_days === "1"
            ? "yes"
            : "no",
        _wc_booking_restricted_days: data._wc_booking_restricted_days || {},
        _wc_booking_max_date: data._wc_booking_max_date || "",
        _wc_booking_max_date_unit: data._wc_booking_max_date_unit || "",
        _wc_booking_max_duration: data._wc_booking_max_duration || "",
        _wc_booking_max_persons_group: data._wc_booking_max_persons_group || "",
        _wc_booking_min_date: data._wc_booking_min_date || "",
        _wc_booking_min_date_unit: data._wc_booking_min_date_unit || "",
        _wc_booking_min_duration: data._wc_booking_min_duration || "",
        _wc_booking_min_persons_group: data._wc_booking_min_persons_group || "",
        _wc_booking_person_cost_multiplier:
          data._wc_booking_person_cost_multiplier ? "yes" : "no",
        _wc_booking_person_qty_multiplier:
          data._wc_booking_person_qty_multiplier ? "yes" : "no",
        _wc_booking_qty: data._wc_booking_qty || "",
        _wc_booking_requires_confirmation:
          data._wc_booking_requires_confirmation === "1" ? "1" : "0",
        _wc_booking_resources_assignment:
          data._wc_booking_resources_assignment || "",
        _wc_booking_resource_label: data._wc_booking_resource_label || "",
        _downloadable: data._downloadable || "",
        _download_limit: data._download_limit || "",
        _download_expiry: data._download_expiry || "",
        _product_version: data._product_version || "",
        _product_attributes: data._product_attributes || {},
        _has_additional_costs: data._has_additional_costs || "",
        _product_addons: data._product_addons || [],
        _product_addons_exclude_global:
          data._product_addons_exclude_global || "",
        _upsell_ids: data._upsell_ids || [],
        _crosssell_ids: data._crosssell_ids || [],
        upsell_works: data.upsell_works || [],
        _wc_average_rating: data._wc_average_rating || "",
        _wc_review_count: data._wc_review_count || "",
        _wc_display_cost: data._wc_display_cost || "",
        _visibility: data._visibility || "",
        _purchase_note: data._purchase_note || "",
        ekit_post_views_count: data.ekit_post_views_count || "",
        _disable_shipping: data.enable_tva ? "no" : "yes",
        _overwrite_shipping: data._overwrite_shipping || "",
        _is_lot_discount: data._is_lot_discount || "",
        _lot_discount_quantity: data._lot_discount_quantity || "",
        _lot_discount_amount: data._lot_discount_amount || "",
        _dps_processing_time: data._dps_processing_time || "",
        rank_math_analytic_object_id: data.rank_math_analytic_object_id || "",
        pharmacie_produit:
          data.pharmacie_produit || data.pharmacy_produit || "",
        prescription_required: data.prescription_required || "",
        _weight: data.weight || "",
        _length: data.length || "",
        _width: data.width || "",
        _height: data.height || "",
        chosen_product_cat: data.chosen_product_cat || [],
        _wc_booking_pricing: data._wc_booking_pricing || [],
        _wc_booking_availability: data._wc_booking_availability || [],
        _class_shipping: data.delivery_class || "",
        _wc_booking_cancel_limit: data._wc_booking_cancel_limit || "",
        _wc_booking_cancel_limit_unit: data._wc_booking_cancel_limit_unit || "",
        resources_details: data.resources_details || [],
        _resource_base_costs: data._resource_base_costs || {},
        _resource_block_costs: data._resource_block_costs || {},
        _yoast_wpseo_metadesc: data.seo_description || "",
        _yoast_wpseo_title: data.seo_title || "",
        _yoast_wpseo_focuskw: data.seo_focuskw || "",
        _yoast_wpseo_metakeywords: data.seo_metakeywords || "",
        rubrique: data.rubrique || "",
      };
      const hasResourcesRaw = data.wc_booking_has_resources;
      data.wc_booking_has_resources = hasResourcesRaw === "1" ? "1" : "0";
      const formData = {
        post_title: data.post_title || "",
        post_name: data.post_name || "",
        post_status: postStatus || "publish",
        post_excerpt: data.short_description || "",
        post_content: data.long_description || "",
        post_author: data.post_author || "",
        post_date: data.post_date || "",
        post_modified: data.post_modified || "",
        post_date_gmt: data.post_date_gmt || "",
        post_modified_gmt: data.post_modified_gmt || "",
        post_password: data.post_password || "",
        comment_status: data.comment_status || "open",
        ping_status: data.ping_status || "open",
        menu_order: data.menu_order || 0,
        post_type: data.post_type || "product",
        post_parent: data.post_parent || 0,
        guid: data.guid || "",
        to_ping: data.to_ping || "",
        pinged: data.pinged || "",
        comment_count: data.comment_count || 0,
        post_content_filtered: data.post_content_filtered || "",
        metaNow,
        resources_details: data.resources_details || [],
        autresLocalisations: autresLocalisations || [],
        devise : devise
      };
      let response;
      if (id) {
        response = await axios.post(
          `${url}/products/edit-product/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        Notiflix.Notify.success("Produit mis à jour avec succès !");
        setSuccess("Produit mis à jour avec succès !");
      } else {
        response = await axios.post(`${url}/products/add-product`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        Notiflix.Notify.success("Produit ajouté avec succès !");
        setSuccess("Produit ajouté avec succès !");
        if (response.data?.product?.ID) {
          navigate(`/reservation/edit/${response.data?.product?.ID}`);
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement du produit.";
      setError(errorMessage);
      Notiflix.Notify.failure(errorMessage);
    } finally {
      nProgress.done();
      setIsSubmitting(false);
      localStorage.setItem("latitude", data.latitude);
      localStorage.setItem("longitude", data.longitude);
      localStorage.setItem("address", data.address);
    }
  };
  useEffect(() => {
    if (isAccommodation && !id) {
      setValue("_wc_booking_min_duration", "");
      setValue("_wc_booking_max_duration", "");
      setValue("_dokan_accommodation_checkin_time", "");
      setValue("_dokan_accommodation_checkout_time", "");
    }
  }, [isAccommodation, setValue, id]);
  const [resourceDetailsOpen, setResourceDetailsOpen] = useState(
    watch("wc_booking_has_resources") === "1"
  );
  useEffect(() => {
    if (watch("wc_booking_has_resources") === "1") {
      setResourceDetailsOpen(true);
    } else {
      setResourceDetailsOpen(false);
    }
  }, [watch("wc_booking_has_resources")]);
  const [resourceResetKey, setResourceResetKey] = useState(0);
  const prevHasResources = useRef(watch("wc_booking_has_resources") === "1");
  const [forceEmptyResources, setForceEmptyResources] = useState(false);
  useEffect(() => {
    const current = watch("wc_booking_has_resources") === "1";
    if (prevHasResources.current && !current) {
      setValue("resources_details", []);
      setValue("_wc_booking_resource_label", "");
      setValue("_wc_booking_resources_assignment", "customer");
      setValue("_resource_base_costs", {});
      setValue("_resource_block_costs", {});
      setResourceResetKey((k) => k + 1);
      setForceEmptyResources(true);
    }
    prevHasResources.current = current;
  }, [watch("wc_booking_has_resources"), setValue]);
  useEffect(() => {
    setForceEmptyResources(false);
  }, [id]);

  const handleLocalisationChange = (newList) => {
    setAutresLocalisations(newList);
  };

  return (
    <div className="min-h-screen w-full">
      <h1 className="text-2xl font-bold mb-4 w-full rounded py-2 ">
        Ajouter une reservation
      </h1>
      {showLink && id && (
        <div className="flex items-center text-xs">
          <div>
            Link of the product :{" "}
            <a
              className="text-green-700"
              href={`${linkProduct}`}
              target="_blank"
            >
              {linkProduct}
            </a>
          </div>
          <div>
            <a href={`${linkProduct}`} target="_blank">
              <button className="text-xs text-white bg-green-700 px-2 py-1.5 rounded ml-2">
                Voir le produit
              </button>
            </a>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full bg-white p-6 rounded shadow-md"
      >
        <div className="md:flex md:flex-row-reverse gap-6">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <ImageGallery
              gallery={gallery}
              setGallery={setGallery}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
            />
          </div>
          <div className="md:w-2/3 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit
              </label>
              <input
                type="text"
                {...register("post_title", { required: "Le nom est requis" })}
                className={`w-full p-2 border rounded ${
                  errors.post_title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.post_title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.post_title.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <CategorieComp
                categorieSelected={categorieSelected}
                setCategorieSelected={setCategorieSelected}
                register={register}
                errors={errors}
              />
            </div>
            <div className="mb-4 flex gap-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  {...register("virtuel")}
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={isVirtuel}
                  onChange={(e) => {
                    setValue("virtuel", e.target.checked);
                    setIsVirtuel(e.target.checked);
                  }}
                />
                <span className="ml-2 text-sm">Virtuel</span>
                <Tooltip content="Service ou bien numérique sans livraison physique.">
                  <span className="ml-1 text-gray-500 cursor-help">?</span>
                </Tooltip>
              </label>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isAccommodation}
                  onChange={(e) => setIsAccommodation(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">Réservation d'hébergement</span>
                <Tooltip content="Active les champs spécifiques aux hébergements (heures d'arrivée/départ).">
                  <span className="ml-1 text-gray-500 cursor-help">?</span>
                </Tooltip>
              </label>
            </div>
            <div className="mb-4">
              <input
                type="text"
                {...register("post_name", { required: "Le slug est requis" })}
                className={`w-full p-2 border hidden rounded ${
                  errors.post_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.post_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.post_name.message}
                </p>
              )}
            </div>
            <MotCleComp
              register={register}
              errors={errors}
              setValue={setValue}
              tagsChoosed={tagsChoosed}
              setTagsChoosed={setTagsChoosed}
            />
            {!isAccommodation && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Durée de réservation
                  <Tooltip content="Durée standard de la réservation.">
                    <span className="ml-1 text-gray-500 cursor-help">?</span>
                  </Tooltip>
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <select
                    {...register("_wc_booking_duration_type")}
                    className="p-3 border rounded border-gray-300 w-full md:w-2/3"
                  >
                    <option value="fixed">Bloc fixe de</option>
                    <option value="customer">
                      Bloc de donné défini par le client
                    </option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_duration")}
                    className="p-3 border rounded border-gray-300 w-full md:w-32"
                    placeholder="Nombre"
                  />
                  <select
                    {...register("_wc_booking_duration_unit")}
                    className="p-3 border rounded border-gray-300 w-full md:w-32"
                  >
                    <option value="month">Mois</option>
                    <option value="year">Année</option>
                    <option value="day">Jour</option>
                    <option value="hour">Heure</option>
                    <option value="night">Nuit</option>
                  </select>
                </div>
              </div>
            )}
            {!isAccommodation && (
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Durée minimale de réservation
                    <Tooltip content="Durée minimale obligatoire pour la réservation.">
                      <span className="ml-1 text-gray-500 cursor-help">?</span>
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_min_duration_non_accommodation")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Durée maximale de réservation
                    <Tooltip content="Durée maximale autorisée pour la réservation.">
                      <span className="ml-1 text-gray-500 cursor-help">?</span>
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_max_duration_non_accommodation")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
              </div>
            )}
            <RubriqueProduct register={register} />
          </div>
        </div>

        {isAccommodation && (
          <div className="w-full mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Nombre minimum de nuits autorisées dans une réservation
                  <Tooltip content="Nombre minimum de nuits obligatoire.">
                    <span className="ml-1 text-gray-500 cursor-help">?</span>
                  </Tooltip>
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_min_duration_accommodation")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Heure de début
                  <Tooltip content="Heure d'arrivée standard pour les clients.">
                    <span className="ml-1 text-gray-500 cursor-help">?</span>
                  </Tooltip>
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <input
                    type="time"
                    {...register("_dokan_accommodation_checkin_time")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Nombre maximale de nuits autorisées dans une réservation
                  <Tooltip content="Nombre maximum de nuits autorisé.">
                    <span className="ml-1 text-gray-500 cursor-help">?</span>
                  </Tooltip>
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_max_duration_accommodation")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Heure de fin
                  <Tooltip content="Heure de départ standard pour les clients.">
                    <span className="ml-1 text-gray-500 cursor-help">?</span>
                  </Tooltip>
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <input
                    type="time"
                    {...register("_dokan_accommodation_checkout_time")}
                    className="p-3 border rounded border-gray-300 w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="md:flex  gap-6">
          <div className="md:w-2/3 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode d'affichage du calendrier
              </label>
              <select
                {...register("_wc_booking_calendar_display_mode")}
                className="p-3 border rounded border-gray-300 w-full"
              >
                <option value="no visible">
                  Affiché le calendrier en un clic
                </option>
                <option value="always_visible">
                  Calendrier toujours visible
                </option>
              </select>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <label className="inline-flex items-center">
                {!isAccommodation && (
                  <>
                    <input
                      type="checkbox"
                      checked={watch("_wc_booking_enable_range_picker") === "1"}
                      onChange={(e) =>
                        setValue(
                          "_wc_booking_enable_range_picker",
                          e.target.checked ? "1" : "0",
                          { shouldDirty: true }
                        )
                      }
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <input
                      type="hidden"
                      {...register("_wc_booking_enable_range_picker")}
                      value={watch("_wc_booking_enable_range_picker") || "0"}
                    />
                    <span className="ml-2 text-sm">
                      {" "}
                      Activer le sélecteur de plage de calendrier ?
                    </span>
                    <Tooltip content="Permet aux clients de sélectionner une période complète d'un coup au lieu de sélectionner jour par jour.">
                      <span className="ml-1 text-gray-500 cursor-help">?</span>
                    </Tooltip>
                  </>
                )}
              </label>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={watch("_wc_booking_requires_confirmation") === "1"}
                  onChange={(e) =>
                    setValue(
                      "_wc_booking_requires_confirmation",
                      e.target.checked ? "1" : "0",
                      { shouldDirty: true }
                    )
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm">
                  {" "}
                  Nécessite une confirmation{" "}
                </span>
                <Tooltip content="Les réservations nécessitent votre validation avant d'être confirmées.">
                  <span className="ml-1 text-gray-500 cursor-help">?</span>
                </Tooltip>
              </label>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={watch("_wc_booking_user_can_cancel") === "1"}
                  onChange={(e) =>
                    setValue(
                      "_wc_booking_user_can_cancel",
                      e.target.checked ? "1" : "0"
                    )
                  }
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <input
                  type="hidden"
                  {...register("_wc_booking_user_can_cancel")}
                  value={watch("_wc_booking_user_can_cancel") || "0"}
                />
                <span className="ml-2 text-sm"> Ne peut pas être annulé ?</span>
                <Tooltip content="Les clients ne peuvent pas annuler leurs réservations une fois confirmées.">
                  <span className="ml-1 text-gray-500 cursor-help">?</span>
                </Tooltip>
              </label>
            </div>
            {watch("_wc_booking_user_can_cancel") === "1" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking can be cancelled
                </label>
                <div className="flex flex-col md:flex-row gap-2 items-center w-full">
                  <input
                    type="number"
                    min="1"
                    {...register("_wc_booking_cancel_limit")}
                    className="p-3 border rounded border-gray-300 w-full md:w-32"
                  />
                  <select
                    {...register("_wc_booking_cancel_limit_unit")}
                    className="p-3 border rounded border-gray-300 w-full md:w-32"
                  >
                    <option value="month">Month</option>
                    <option value="day">Day</option>
                    <option value="hour">Hour</option>
                    <option value="minutes">Minute(s)</option>
                  </select>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    avant la date de début
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="mb-4 mt-8">
            <label className="block mb-2 font-semibold">
              Description courte
            </label>
            {product ? (
              <EditorComp
                Ref={shortDescriptionEditorRef}
                height={100}
                defaultvalue={product?.post_excerpt || null}
              />
            ) : (
              <EditorComp
                Ref={shortDescriptionEditorRef}
                height={100}
                defaultvalue={null}
              />
            )}
          </div>

          <div className="mb-4 mt-8">
            <label className="block mb-2 font-semibold">
              Description longue
            </label>
            {product ? (
              <EditorComp
                Ref={longDescriptionEditorRef}
                height={200}
                defaultvalue={product?.post_content || null}
              />
            ) : (
              <EditorComp
                Ref={longDescriptionEditorRef}
                height={200}
                defaultvalue={null}
              />
            )}
          </div>
          <div className="my-6">
            <LivraisonEtTva
              register={register}
              errors={errors}
              watch={watch}
              isVirtuel={isVirtuel ? "yes" : "no"}
              setValue={setValue}
              productData={product}
            />
          </div>
          <div className="my-6">
            <GeolocalisationComp
              register={register}
              setValue={setValue}
              defaultLat={product?.metaNow?.dokan_geo_latitude || undefined}
              defaultLng={product?.metaNow?.dokan_geo_longitude || undefined}
              defaultAddress={product?.metaNow?.dokan_geo_address || undefined}
              autresLocalisations={autresLocalisations}
              onChange={handleLocalisationChange}
            />
          </div>
          <div className="my-6">
            <DisponibiliteComp
              register={register}
              errors={errors}
              hideBufferOptions={isAccommodation}
              defaultOpen={true}
              watch={watch}
              setValue={setValue}
              productData={product}
            />
          </div>
          <div className="my-6">
            <TarifsComp
              register={register}
              errors={error}
              defaultOpen={true}
              watch={watch}
              setValue={setValue}
              productData={product}
            />
          </div>
          <div className="my-6">
            <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="mb-4">
                <span className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full">
                  <FontAwesomeIcon icon={faWrench} className="mr-3" />A des
                  ressources
                  <span className="text-base font-normal text-gray-600 ml-2 self-center">
                    (Définir si ce produit a des ressources)
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={watch("wc_booking_has_resources") === "1"}
                      onChange={(e) =>
                        setValue(
                          "wc_booking_has_resources",
                          e.target.checked ? "1" : "0",
                          { shouldDirty: true }
                        )
                      }
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <input
                      type="hidden"
                      {...register("wc_booking_has_resources")}
                      value={watch("wc_booking_has_resources") || "0"}
                    />
                    <span className="ml-2 text-sm">A des ressources</span>
                  </label>
                </div>
              </div>
            </div>
            {resourceDetailsOpen && (
              <ResourceAddComp
                key={resourceResetKey}
                register={register}
                errors={error}
                setValue={setValue}
                productData={product}
                watch={watch}
                id={id}
                forceEmptyResources={forceEmptyResources}
              />
            )}
          </div>
          <div className="my-6">
            <InventairesComp
              register={register}
              errors={errors}
              watch={watch}
              productData={product}
              setValue={setValue}
            />
          </div>
          <div className="my-6">
            <SeoComp register={register} errors={errors} />
          </div>
          <div className="max-w-96">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              {...register("post_status")}
              value={postStatus}
              onChange={(e) => setPostStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="draft">Brouillon</option>
              <option value="publish">Publié</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className={`mt-4 w-64 p-2 bg-[#f6858b] hover:bg-[#b92b32] text-white rounded ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "En cours..."
              ) : (
                <>
                  {id ? "Mettre à jour le produit" : "Enregistrer le produit"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
