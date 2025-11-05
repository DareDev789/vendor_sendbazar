import { useEffect, useRef, useState } from "react";
import ImageGallery from "../../utils/ImageGallery";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "../../contextes/helpers";
import axios from "axios";
import Notiflix from "notiflix";
import nProgress from "nprogress";
//import CategorieComp from '../../utils/CategorieComp';
import MotCleComp from '../../utils/MotCleComp';
import DescriptionCircuit from './DescriptionCircuit';
import ItineraireCircuit from './ItineraireCircuit';
import NiveauConfortCircuit from './NiveauConfortCircuit';
import InclusNonInclusCircuit from './InclusNonInclusCircuit';
import { url } from '../../contextes/UrlContext';
import { url_frontend } from '../../contextes/UrlContext';
import { formReset } from '../../utils/FormReset';
import SeoComp from "../../utils/SeoComp";
import InventairesComp from "../../utils/InventairesComp";
import { useDevise } from "../../contextes/DeviseContext";

export default function AddCircuit() {
    const { register, handleSubmit, watch, setValue, formState: { errors }, control, reset } = useForm();
    const [gallery, setGallery] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [postStatus, setPostStatus] = useState('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLink, setShowLink] = useState(false);
    // const [categorieSelected, setCategorieSelected] = useState([]);
    const [tagsChoosed, setTagsChoosed] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const [linkProduct, setLinkProduct] = useState('');
    const [product, setProduct] = useState(null);
    const name = watch('post_title');
    const slug = watch('post_name');
    const token = localStorage.getItem('token');
    const descriptionEditorRef = useRef(null);
    const itineraireEditorRef = useRef(null);
    const inclusEditorRef = useRef(null);
    const nonInclusEditorRef = useRef(null);
    const { devise, listDevise } = useDevise();

    useEffect(() => {
        if (name) {
            setValue('post_name', slugify(name));
        }
        if (slug && slug?.trim() !== '') {
            setLinkProduct(`${url_frontend}/produit/${slug}`);
            setShowLink(true);
        } else {
            setLinkProduct('');
            setShowLink(false);
        }
    }, [name, slug, setValue]);


    const fectOneProductToPut = async () => {
        try {
            nProgress.start();
            const response = await axios.get(`${url}/products/getOneProduct/${id}?devise=${devise}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const product = response.data.product;
            if (!product || !product.metaNow) {
                return;
            }
            setProduct(product);
            const metaNow = product.metaNow;

            formReset(reset, product, metaNow, setGallery, setThumbnail);
            {/*const termIds = product?.categories.map(cat => cat.term_id);
            setCategorieSelected(termIds);*/}
            const tagsChoosed = product?.tags?.map(cat => ({
                id: cat.term_id,
                name: cat.name
            }));
            setTagsChoosed(tagsChoosed);
            if (product.post_status) setPostStatus(product.post_status);
        } catch (error) {
            console.error('Erreur lors de la récupération du produit:', error);
        } finally {
            nProgress.done();
        }
    };
    useEffect(() => {
        if (id) {
            fectOneProductToPut();
        }
    }, [id]);

    const onSubmit = async (data) => {
        setError('');
        setIsSubmitting(true);
        nProgress.start();
        try {
            if (descriptionEditorRef.current) {
                data._circuit_description = descriptionEditorRef.current.getData();
            }
            if (itineraireEditorRef.current) {
                data._circuit_itineraire = itineraireEditorRef.current.getData();
            }
            if (inclusEditorRef.current) {
                data._circuit_inclus = inclusEditorRef.current.getData();
            }
            if (nonInclusEditorRef.current) {
                data._circuit_non_inclus = nonInclusEditorRef.current.getData();
            }
            if (typeof data._circuit_prix_basic === 'string') data._circuit_prix_basic = data._circuit_prix_basic.replace(',', '.');
            if (typeof data._circuit_prix_confort === 'string') data._circuit_prix_confort = data._circuit_prix_confort.replace(',', '.');
            if (typeof data._circuit_prix_premium === 'string') data._circuit_prix_premium = data._circuit_prix_premium.replace(',', '.');
            const metaNow = {
                _thumbnail_id: thumbnail ? [thumbnail] : [],
                _product_image_gallery: gallery,
                //categorieSelected,
                tags: tagsChoosed,
                _is_circuit: "yes",
                _circuit_type: data._circuit_type || "",
                _circuit_duree_jour: data._circuit_duree_jour || "",
                _circuit_duree_nuit: data._circuit_duree_nuit || "",
                _circuit_niveau_basic: data._circuit_niveau_basic ? "yes" : "no",
                _circuit_niveau_confort: data._circuit_niveau_confort ? "yes" : "no",
                _circuit_niveau_premium: data._circuit_niveau_premium ? "yes" : "no",
                _circuit_prix_basic: data._circuit_niveau_basic ? data._circuit_prix_basic : "",
                _circuit_prix_confort: data._circuit_niveau_confort ? data._circuit_prix_confort : "",
                _circuit_prix_premium: data._circuit_niveau_premium ? data._circuit_prix_premium : "",
                _circuit_inclus: data._circuit_inclus || "",
                _circuit_non_inclus: data._circuit_non_inclus || "",
                _sku: data.stock_unit || "",
                _stock_status: "instock",
                _virtual: "yes",
                _visibility: "visible",
                _class_shipping: data.delivery_class || '',
                _yoast_wpseo_metadesc: String(data.seo_description || ''),
                _yoast_wpseo_title: String(data.seo_title || ''),
                _yoast_wpseo_focuskw: String(data.seo_focuskw || ''),
                _yoast_wpseo_metakeywords: String(data.seo_metakeywords || ''),
                _manage_stock: String(data.manage_stock ? 'yes' : 'no'),
                _stock: String(data.inventory || ''),
                _low_stock_amount: String(data.min_inventory || ''),
                _tax_status: String(data.etat_tva || 'none'),
                _currency: '€'
            };
            const formData = {
                post_title: data.post_title || "",
                post_name: data.post_name || "",
                post_status: postStatus || "draft",
                post_excerpt: data._circuit_description || '',
                post_content: data._circuit_itineraire || '',
                post_type: data.post_type || "product",
                metaNow,
                devise: devise
            };
            let link;
            if (id) {
                link = `${url}/products/edit-product/${id}`;
            } else {
                link = `${url}/products/add-product`;
            }
            const response = await axios.post(link, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            const postId = response.data?.product?.ID;
            if (!postId) throw new Error('ID du post manquant');
            Notiflix.Notify.success(response.data.message);
            if (id) {
                await fectOneProductToPut();
            } else {
                navigate(`/circuit/edit/${postId}`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement du circuit.";
            setError(errorMessage);
            Notiflix.Notify.failure(errorMessage);
        } finally {
            nProgress.done();
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen w-full">
            <h1 className="text-2xl font-bold mb-4 text-center w-full rounded py-2 text-[#f6858b]">
                {id ? 'Modifier le circuit' : 'Ajouter un circuit'}
            </h1>
            {showLink && (
                <div className='flex items-center text-xs'>
                    <div>Link of the product : <a className='text-green-700' href={`${linkProduct}`} target='_blank'>{linkProduct}</a></div>
                    <div><a href={`${linkProduct}`} target='_blank'><button className='text-xs text-white bg-green-700 px-2 py-1.5 rounded ml-2'>Voir le produit</button></a></div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-white p-6 rounded shadow-md">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du circuit</label>
                            <input
                                type="text"
                                {...register('post_title', { required: 'Le nom est requis' })}
                                className={`w-full p-2 border rounded ${errors?.post_title ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors?.post_title && <p className="text-red-500 text-xs mt-1">{errors.post_title.message}</p>}
                        </div>
                        <div className="mb-4 hidden">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Slug du circuit</label>
                            <input
                                type="text"
                                {...register('post_name', { required: 'Le titre est requis' })}
                                className={`w-full p-2 border rounded ${errors?.post_name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors?.post_name && <p className="text-red-500 text-xs mt-1">{errors.post_name.message}</p>}
                        </div>
                        {/*<CategorieComp categorieSelected={categorieSelected} setCategorieSelected={setCategorieSelected} />*/}
                        <MotCleComp register={register} errors={errors} setValue={setValue} tagsChoosed={tagsChoosed} setTagsChoosed={setTagsChoosed} />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type de circuit</label>
                            <select
                                {...register('_circuit_type', { required: 'Le type de circuit est requis' })}
                                className={`w-full p-2 border rounded ${errors._circuit_type ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="Terrestre">Terrestre</option>
                                <option value="Maritime">Maritime</option>
                                <option value="Excursion">Excursion</option>
                            </select>
                            {errors._circuit_type && <p className="text-red-500 text-xs mt-1">{errors._circuit_type.message}</p>}
                        </div>
                        <div className="mb-4 flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Durée du jour</label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('_circuit_duree_jour')}
                                    className="w-full p-2 border rounded"
                                    placeholder="Nombre de jours"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Durée de nuit</label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('_circuit_duree_nuit')}
                                    className="w-full p-2 border rounded"
                                    placeholder="Nombre de nuits"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-6">
                    <InventairesComp is_circuit={true} register={register} errors={errors} watch={watch} setValue={setValue} />
                </div>
                <div className="my-6">
                    <DescriptionCircuit
                        descriptionEditorRef={descriptionEditorRef}
                        setValue={setValue}
                        value={watch('_circuit_description')}
                    />
                </div>
                <div className="my-6">
                    <ItineraireCircuit
                        itineraireEditorRef={itineraireEditorRef}
                        setValue={setValue}
                        value={watch('_circuit_itineraire')}
                    />
                </div>
                <div className="my-6">
                    <NiveauConfortCircuit register={register} setValue={setValue} watch={watch} errors={errors} />
                </div>
                <div className="my-6">
                    <InclusNonInclusCircuit
                        inclusEditorRef={inclusEditorRef}
                        nonInclusEditorRef={nonInclusEditorRef}
                        inclusValue={watch('_circuit_inclus')}
                        nonInclusValue={watch('_circuit_non_inclus')}
                    />
                </div>
                <div className="my-6">
                    <SeoComp
                        register={register} errors={errors} />
                </div>
                <div className="w-full mt-6">
                    <div className="max-w-96">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select
                            {...register('post_status')}
                            value={postStatus}
                            onChange={(e) => setPostStatus(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="publish">Publié</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/circuit/list')}
                            className="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className={`mt-4 px-6 py-2 bg-[#f6858b] hover:bg-[#b92b32] text-white rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'En cours...' : (id ? 'Mettre à jour' : 'Enregistrer le circuit')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}