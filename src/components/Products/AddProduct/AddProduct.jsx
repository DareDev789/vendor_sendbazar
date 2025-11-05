import { useEffect, useRef, useState } from "react";
import ImageGallery from "../../../utils/ImageGallery";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { slugify } from "../../../contextes/helpers";
import axios from "axios";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import EditorComp from "../../../utils/EditorComp";
import SeoComp from "../../../utils/SeoComp";
import InventairesComp from "../../../utils/InventairesComp";
import LivraisonEtTva from "../../../utils/LivraisonEtTva";
import MotCleComp from "../../../utils/MotCleComp";
import CategorieComp from "../../../utils/CategorieComp";
import AttributsComp from "../../../utils/AttributsComp";
import GeolocalisationComp from "../../../utils/GeolocalisationComp";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { url_frontend } from "../../../contextes/UrlContext";
import { url } from "../../../contextes/UrlContext";
import VariationsComp from "../../../utils/VariationsComp";
import RubriqueProduct from "../../../utils/RubriqueProduct";
import { useDevise } from "../../../contextes/DeviseContext";

library.add(faImage);

export default function Add() {
  const [product, setProduct] = useState(null);
  const [loadFecth, setLoadFetch] = useState(false);
  const { id } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
    reset,
  } = useForm();
  const [gallery, setGallery] = useState([]);
  const [status, setStatus] = useState("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsChoosed, setTagsChoosed] = useState([]);
  const [variationsLists, setVariationsLists] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const shortDescriptionEditorRef = useRef(null);
  const longDescriptionEditorRef = useRef(null);
  const [linkProduct, setLinkProduct] = useState("");
  const [error, setError] = useState(null);
  const [autresLocalisations, setAutresLocalisations] = useState([]);
  const navigate = useNavigate();
  const { devise, listDevise } = useDevise();

  const name = watch("title");
  const slug = watch("slug");

  useEffect(() => {
    if (name) {
      const generatedSlug = slugify(name);
      setValue("slug", generatedSlug);
    }
  }, [name, setValue]);

  const selectedType = watch("type");

  const [categorieSelected, setCategorieSelected] = useState([]);
  const token = localStorage.getItem("token");

  const isPharma = watch("is_pharma");

  const [isVirtuel, setIsVirtuel] = useState(false);

  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    fectOneProductToPut();
  }, [id, reset]);

  // Initialiser les valeurs par défaut pour les nouveaux produits
  useEffect(() => {
    if (!id) {
      setValue("stock_status", "instock");
      setValue("allow_backorders", "no");
    }
  }, [id, setValue]);

  const fectOneProductToPut = async () => {
    if (id) {
      setLoadFetch(true);
      nProgress.start();
      axios
        .get(`${url}/products/getOneProduct/${id}?devise=${devise}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const product = response.data.product;
          setProduct(product);

          const termIds = product?.categories.map((cat) => cat.term_id);
          setCategorieSelected(termIds);

          const tagsChoosed = product?.tags.map((cat) => ({
            id: cat.term_id,
            name: cat.name,
          }));
          setTagsChoosed(tagsChoosed);
          setAutresLocalisations(product?.autresLocalisations || []);
          setGallery(product.metaNow._product_image_gallery || []);
          setVariationsLists(product.variations || []);
          setAttributes(product.metaNow._product_attributes || []);
          setLinkProduct(`${url_frontend}/produit/${product?.post_name || ""}`);
          let delivery_class = "";
          if (
            product &&
            Array.isArray(product.shipping_classes) &&
            product.shipping_classes.length > 0 &&
            product.shipping_classes[0].term_taxonomy_id
          ) {
            delivery_class = product.shipping_classes[0].term_taxonomy_id;
          }
          reset({
            title: product.post_title || "",
            type: product?.product_type || "simple",
            telechargeable:
              product.metaNow?._downloadable === "yes" ? true : false,
            virtuel: product.metaNow?._virtual === "yes" ? true : false,
            regular_price: product.metaNow?._regular_price
              ? Number(product.metaNow?._regular_price)
              : Number(product.metaNow?._price),
            sale_price:
              product.metaNow?._sale_price &&
              product.metaNow?._sale_price !== ""
                ? Number(product.metaNow?._sale_price)
                : "",
            supplier_name: product.supplier_name || "",
            status: product.post_status || "draft",
            product_url: product.guid || "",

            address: product.metaNow?.dokan_geo_address || "",
            latitude: product.metaNow?.dokan_geo_latitude || "",
            longitude: product.metaNow?.dokan_geo_longitude || "",

            weight: product.metaNow?._weight || "",
            length: product.metaNow?._length || "",
            width: product.metaNow?._width || "",
            height: product.metaNow?._height || "",
            etat_tva: product.metaNow?._tax_status || "none",
            taux_tva: product.metaNow?._tax_class || "",
            is_pharma: product.metaNow?.pharmacie_produit === "yes",
            pharma_type:
              product.metaNow?.pharmacie_produit === "yes"
                ? product.metaNow?.prescription_required || ""
                : "",
            _is_anti_gaspillage: product.metaNow?._is_anti_gaspillage === "yes",
            manage_stock:
              product?.metaNow?._manage_stock === "yes" ? true : false,
            inventory: product?.metaNow?._stock
              ? Number(product.metaNow?._stock).toFixed(0)
              : "",
            min_inventory: product?.metaNow?._low_stock_amount
              ? Number(product.metaNow?._low_stock_amount).toFixed(0)
              : "",
            stock_unit: product?.metaNow?._sku || "",
            stock_status: product?.metaNow?._stock_status || "instock",
            seo_title: product?.metaNow?._yoast_wpseo_title || "",
            seo_description: product?.metaNow?._yoast_wpseo_metadesc || "",
            allow_backorders:
              product?.metaNow?._backorders !== undefined &&
              product?.metaNow?._backorders !== null
                ? product?.metaNow?._backorders
                : "no",
            enable_tva: product.metaNow?._disable_shipping === "no",
            delivery_class: delivery_class,
            rubrique: product?.metaNow?.rubrique || "",
          });
          setStatus(product?.post_status || "draft");

          if (product.images && Array.isArray(product.images)) {
            setGallery(
              product.images.map((img, i) => ({
                url: img,
                alt: "",
                file: null,
                id: `loaded-${i}`,
              }))
            );
          }
        })
        .catch((err) => {
          console.error("Erreur lors du chargement du produit:", err);
        })
        .finally(() => {
          setLoadFetch(false);
          nProgress.done();
        });
    }
  };

  useEffect(() => {
    if (product && product.metaNow) {
      setIsVirtuel(product.metaNow._virtual === "yes");
      setThumbnail(product.metaNow._thumbnail_id?.[0] || null);
    }
  }, [product]);

  const onSubmit = async (data) => {
    if (shortDescriptionEditorRef.current) {
      data.short_description = shortDescriptionEditorRef.current.getData();
    }
    if (longDescriptionEditorRef.current) {
      data.long_description = longDescriptionEditorRef.current.getData();
    }
    if (typeof data.regular_price === 'string') {
      data.regular_price = data.regular_price.replace(',', '.');
    }
    if (typeof data.sale_price === 'string') {
      data.sale_price = data.sale_price.replace(',', '.');
    }

    const metaNow = {
      _product_image_gallery: gallery,
      _thumbnail_id: thumbnail ? [thumbnail] : [],
      _product_attributes: selectedType === "variable" ? attributes : [],
      _downloadable: data.telechargeable ? "yes" : "no",
      _virtual: data.virtuel ? "yes" : "no",
      _regular_price: String(
        selectedType === "variable"
          ? ""
          : parseFloat(data.regular_price) > 0
          ? data.regular_price
          : ""
      ),
      _sale_price: String(
        selectedType === "variable"
          ? ""
          : parseFloat(data.sale_price) > 0
          ? data.sale_price
          : ""
      ),
      _sku: String(data.stock_unit || ""),
      _manage_stock: String(data.manage_stock ? "yes" : "no"),
      _stock: String(data.inventory || ""),
      _low_stock_amount: String(data.min_inventory || ""),
      _tax_status: String(data.etat_tva || "none"),
      dokan_geo_latitude: String(data.latitude || ""),
      dokan_geo_longitude: String(data.longitude || ""),
      dokan_geo_address: String(data.address || ""),
      _disable_shipping: String(data.enable_tva ? "no" : "yes"),
      _stock_status: data.stock_status || "",
      _backorders:
        data.allow_backorders !== undefined ? data.allow_backorders : "",
      _weight: String(data.weight || ""),
      _height: String(data.height || ""),
      _length: String(data.length || ""),
      _width: String(data.width || ""),
      _tax_class: String(data.taux_tva || ""),
      _downloadable_files: data.fichiers_telechargeables || [],
      _download_limit: String(data.telechargement_limite || ""),
      _download_expiry: String(data.telechargement_expiration || ""),
      _purchase_note: String(data.note_achat || ""),
      _yoast_wpseo_metadesc: String(data.seo_description || ""),
      _yoast_wpseo_title: String(data.seo_title || ""),
      _yoast_wpseo_focuskw: String(data.seo_focuskw || ""),
      _yoast_wpseo_metakeywords: String(data.seo_metakeywords || ""),
      pharmacie_produit: String(data.is_pharma ? "yes" : "no"),
      prescription_required: String(data.pharma_type || ""),
      categorieSelected,
      tags: tagsChoosed,
      product_type: selectedType || "simple",
      _class_shipping: data.delivery_class || "",
      _currency: "€",
    };
    if (data._is_anti_gaspillage) {
      metaNow._is_anti_gaspillage = "yes";
    }

    if (data.is_pharma) {
      metaNow.rubrique = "";
    } else {
      metaNow.rubrique = data.rubrique || "";
    }

    if (selectedType === "variable") {
      metaNow._create_variation = "yes";
    }

    const formData = {
      post_title: data.title,
      post_name: slugify(data.title),
      post_status: status,
      post_type: "product",
      supplier_name: data.supplier_name || "",
      guid: data.product_url || "",
      post_excerpt: data.short_description || "",
      post_content: data.long_description || "",
      metaNow,
      variations: selectedType === "variable" ? variationsLists : [],
      autresLocalisations: autresLocalisations || [],
      devise: devise,
    };
    try {
      setError(null);
      nProgress.start();

      let link;
      if (id) {
        link = `${url}/products/edit-product/${id}`;
      } else {
        link = `${url}/products/add-product`;
      }

      const response = await axios.post(link, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      const postId = response.data?.product?.ID;
      if (!postId) throw new Error("ID du post manquant");

      Notiflix.Notify.success(
        response.data.message || "Produit enregistré avec succès !"
      );
      if (id) {
        await fectOneProductToPut();
      } else {
        navigate(`/products/edit/${postId}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.error || "Une erreur est survenue");
    } finally {
      nProgress.done();
      localStorage.setItem("latitude", data.latitude);
      localStorage.setItem("longitude", data.longitude);
      localStorage.setItem("address", data.address);
    }
  };

  const [vari, setVari] = useState(false);

  useEffect(() => {
    if (selectedType === "variable") {
      setValue("regular_price", "");
      setValue("sale_price", "");
      setVari(false);
    }
  }, [selectedType, setValue]);

  const handleAntigaspiChange = async (e) => {
    const checked = e.target.checked;
    setValue("_is_anti_gaspillage", checked);
  };

  const handleLocalisationChange = (newList) => {
    setAutresLocalisations(newList);
  };

  return (
    <div className="min-h-screen w-full">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Modifier le produit" : "Ajouter Nouveau Produit"}
      </h1>

      {id && (
        <div className="flex items-center text-xs">
          <div>
            Lien du produit :{" "}
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
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-6 rounded shadow-md"
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
                Titre
              </label>
              <input
                type="text"
                {...register("title", { required: "Le nom est requis" })}
                className={`w-full p-2 border text-gray-700 rounded ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                type="text"
                {...register("slug")}
                className={`w-full p-2 border hidden rounded ${
                  errors.slug ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de produit
              </label>
              <select
                defaultValue={"simple"}
                {...register("type", {
                  required: "Le type de produit est requis",
                })}
                className={`w-full p-2 border text-gray-700 rounded ${
                  errors.type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="simple">Unique</option>
                <option value="variable">Variable</option>
                <option value="external">Produit externe / affilié</option>
                <option value="group">Œuvre du groupe</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {selectedType === "simple" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      {...register("telechargeable")}
                      className="text-blue-600"
                    />
                    Téléchargeable
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      {...register("virtuel")}
                      className="text-blue-600"
                      checked={isVirtuel}
                      onChange={(e) => setIsVirtuel(e.target.checked)}
                    />
                    Virtuel
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px]">
                      {listDevise[devise]}
                    </span>
                    <input
                      type="number"
                      step="any"
                      {...register("regular_price", {
                        required: "Le prix est requis",
                      })}
                      className={`w-full p-2 pl-8 border rounded ${
                        errors.regular_price
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.regular_price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.regular_price.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix réduit
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-700 bg-gray-200 border border-r-0 border-gray-300 rounded-l h-[42px]">
                      {listDevise[devise]}
                    </span>
                    <input
                      type="number"
                      step="any"
                      {...register("sale_price")}
                      className={`w-full p-2 text-gray-700 border rounded ${
                        errors.sale_price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.sale_price && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.sale_price.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {selectedType === "variable" && <br />}
            {selectedType === "external" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Url du produit
                  </label>
                  <input
                    type="url"
                    {...register("product_url")}
                    placeholder="https://exemple.com"
                    className="w-full p-2 text-gray-700 border rounded border-gray-300"
                  />
                  {errors.product_url && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.product_url.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm  font-medium text-gray-700 mb-2">
                    Boutton texte
                  </label>
                  <input
                    type="text"
                    {...register("supplier_name")}
                    className="w-full p-2 border rounded border-gray-300"
                  />
                  {errors.supplier_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.supplier_name.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {selectedType === "group" && <br />}

            <CategorieComp
              categorieSelected={categorieSelected}
              setCategorieSelected={setCategorieSelected}
              register={register}
              errors={errors}
            />

            <MotCleComp
              register={register}
              errors={errors}
              setValue={setValue}
              tagsChoosed={tagsChoosed}
              setTagsChoosed={setTagsChoosed}
            />
          </div>
        </div>

        <div className="w-full mt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="_is_anti_gaspillage"
              {...register("_is_anti_gaspillage", {
                onChange: handleAntigaspiChange,
              })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="_is_anti_gaspillage"
              className="text-sm font-medium text-gray-700"
            >
              Produit anti-gaspillage ?
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-gray-100 mt-10 p-3">
            <div className="">
              <input
                type="checkbox"
                id="is_pharma"
                {...register("is_pharma")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mr-2"
              />
              <label
                htmlFor="is_pharma"
                className="text-sm font-medium text-gray-700"
              >
                Produit pharmaceutique ?
              </label>
            </div>
            <div className="">
              {isPharma ? (
                <div>
                  <label
                    htmlFor="pharma_type"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ordonnance requise
                  </label>
                  <select
                    id="pharma_type"
                    {...register("pharma_type", {
                      required: "Veuillez sélectionner un type",
                    })}
                    className="p-2 border border-gray-300 rounded text-sm w-full"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
              ) : (
                <RubriqueProduct register={register} />
              )}
            </div>
          </div>

          {errors.pharma_type && isPharma && (
            <p className="text-red-500 text-xs mt-1">
              {errors.pharma_type.message}
            </p>
          )}

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

          <InventairesComp
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />

          <SeoComp register={register} errors={errors} />

          <LivraisonEtTva
            register={register}
            errors={errors}
            watch={watch}
            isVirtuel={isVirtuel ? "yes" : "no"}
            setValue={setValue}
          />

          {selectedType === "variable" && (
            <VariationsComp
              name={name}
              product={product}
              variations={variationsLists}
              setVariations={setVariationsLists}
              attributes={attributes}
              setAttributes={setAttributes}
            />
          )}

          <GeolocalisationComp
            register={register}
            setValue={setValue}
            defaultLat={product?.metaNow?.dokan_geo_latitude || null}
            defaultLng={product?.metaNow?.dokan_geo_longitude || null}
            defaultAddress={product?.metaNow?.dokan_geo_address || null}
            autresLocalisations={autresLocalisations}
            onChange={handleLocalisationChange}
          />

          <div className="max-w-96">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              {...register("status")}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="draft">Brouillon</option>
              <option value="publish">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className={`mt-4 w-64 p-2 bg-purple-600 text-white rounded ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loadFecth || isSubmitting}
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
