import { useEffect, useRef, useState } from "react";
import ImageGallery from "../../utils/ImageGallery";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "../../contextes/helpers";
import axios from "axios";
import Notiflix from "notiflix";
import nProgress from "nprogress";
import EditorComp from "../../utils/EditorComp";
import InventairesComp from "../../utils/InventairesComp";
import SeoComp from "../../utils/SeoComp";
import DownloadBilletComp from "../../utils/DownloadBilletComp";
import CategorieComp from "../../utils/CategorieComp";
import MotCleComp from "../../utils/MotCleComp";
import DateBillerieComp from "../../utils/DateBillerieComp";
import PrixProduitsComp from "../../utils/PrixProduitsComp";
import { url } from '../../contextes/UrlContext';
import { url_frontend } from '../../contextes/UrlContext';
import { useDevise } from "../../contextes/DeviseContext";

export default function AddBilleterie() {
    const { register, handleSubmit, watch, setValue, formState: { errors }, control, reset } = useForm();
    const [gallery, setGallery] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [status, setStatus] = useState('draft');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLink, setShowLink] = useState('');
    const [categorieSelected, setCategorieSelected] = useState([]);
    const [tagsChoosed, setTagsChoosed] = useState([]);
    const [errorBillet, setErrorBillet] = useState(null);
    const [loadFecth, setLoadFetch] = useState(false);

    const [billet, setBillet] = useState(null);
    const [typebillet, setTypeBillet] = useState(1);
    const [focusTypebillet, setFocusTypeBillet] = useState(1);
    const { devise } = useDevise();

    const shortDescriptionEditorRef = useRef(null);
    const longDescriptionEditorRef = useRef(null);

    const [linkProduct, setLinkProduct] = useState('');
    const navigate = useNavigate();

    const { id } = useParams();
    const [product, setProduct] = useState(null);

    const name = watch('title');
    const slug = watch('slug');
    const type = watch('type');

    useEffect(() => {
        if (name) {
            const generatedSlug = slugify(name);
            setValue('slug', generatedSlug);
        }
    }, [name, setValue]);

    const token = localStorage.getItem('token');

    const fectOneProductToPut = async () => {
        setLoadFetch(true);
        try {
            nProgress.start();
            const response = await axios.get(`${url}/products/getOneProduct/${id}?devise=${devise}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const product = response.data.product;

            const tagsChoosed = product?.tags.map(cat => ({
                id: cat.term_id,
                name: cat.name
            }));
            setTagsChoosed(tagsChoosed);
            setLinkProduct(`${url_frontend}/produit/${product?.post_name || ''}`);

            setGallery(product.metaNow._product_image_gallery);
            setThumbnail(product?.metaNow?._thumbnail_id?.[0] || null);
            const termIds = product?.categories.map(cat => cat.term_id);
            setCategorieSelected(termIds);
            if (product?.metaNow?._url_ticket && product?.metaNow?._url_ticket !== '') {
                setBillet({
                    id: Date.now().toString(),
                    url: product?.metaNow?._url_ticket,
                    // url : 'https://back.sendbazar.com/storage/billets/20250729_081655_6888837748f7e.jpeg',
                });
            }

            setTypeBillet(product?.metaNow?._type_billet || '1');
            setFocusTypeBillet(product?.metaNow?._type_billet || '1');

            setValue('regular_price', product?.metaNow?._regular_price ? Number(product.metaNow?._regular_price).toFixed(2) : '');
            setValue('sale_price', product?.metaNow?._sale_price ? Number(product.metaNow?._sale_price).toFixed(2) : '');
            setValue('date_event', product?.metaNow?._date_event || '');
            setValue('end_date_vente', product?.metaNow?._end_date_vente || '');
            setValue('time_ouverture_guichet', product?.metaNow?._time_ouverture_guichet || '');

            setValue('time_fermeture_guichet', product?.metaNow?._time_fermeture_guichet || '');
            setValue('billet', product?.metaNow?._url_ticket || '');
            setValue('manage_stock', product?.metaNow?._manage_stock === 'yes' ? true : false);
            setValue('inventory', product?.metaNow?._stock ? Number(product.metaNow?._stock).toFixed(0) : '');
            setValue('min_inventory', product?.metaNow?._low_stock_amount ? Number(product.metaNow?._low_stock_amount).toFixed(0) : '');
            setValue('stock_unit', product?.metaNow?._sku || '');

            setValue('allow_backorders', product?.metaNow?._backorders === 'yes' ? true : false);
            setValue('location', product?.metaNow?._location || '');
            setValue('seo_title', product?.metaNow?._yoast_wpseo_title || '');
            setValue('seo_description', product?.metaNow?._yoast_wpseo_metadesc || '');

            setValue('title', product?.post_title || '');
            setValue('slug', product?.post_name || '');
            setValue('type', 'simple');
            setStatus(product?.post_status || '');
            setShowLink(`${url_frontend}/produit/${product?.post_name}`);
            setProduct(product);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            nProgress.done();
            setLoadFetch(false);
        }
    }

    useEffect(() => {
        if (id) {
            fectOneProductToPut();
        }
    }, [id]);

    const onSubmit = async (data) => {
        if (!billet || !billet.url) {
            setErrorBillet('Le billet est requis');
            return;
        }

        if (billet && !billet.url) {
            setErrorBillet('Le billet est requis');
            return;
        } else {
            setErrorBillet(null);
        }

        setIsSubmitting(true);
        setError('');

        try {
            nProgress.start();

            if (shortDescriptionEditorRef.current) {
                data.short_description = shortDescriptionEditorRef.current.getData();
            }
            if (longDescriptionEditorRef.current) {
                data.long_description = longDescriptionEditorRef.current.getData();
            }
            if (typeof data.regular_price === 'string') data.regular_price = data.regular_price.replace(',', '.');
            if (typeof data.sale_price === 'string') data.sale_price = data.sale_price.replace(',', '.');
            const formData = {
                ...data,
                status,
                gallery,
                thumbnail,
                categorieSelected,
                tags: tagsChoosed,
                billet: billet?.url || null,
                typebillet,
                devise,
            };

            let link;
            if (id) {
                link = `${url}/products/edit-billerie/${id}`;
            } else {
                link = `${url}/products/add-billerie`;
            }

            const response = await axios.post(link, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            const postId = response.data?.post?.ID;
            if (!postId) throw new Error('ID du post manquant');

            Notiflix.Notify.success(response.data.message);
            if (id) {
                await fectOneProductToPut();
            } else {
                navigate(`/billeterie/edit/${postId}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
            nProgress.done();
        }
    };


    return (
        <div className="min-h-screen w-full">
            <h1 className="text-3xl font-bold mb-4 text-[#f6858b]">Ajouter une Billeterie</h1>
            {id && (
                <div className='flex items-center text-xs'>
                    <div>Lien du produit : <a className='text-green-700' href={`${showLink}`} target='_blank'>{showLink}</a></div>
                    <div><a href={`${showLink}`} target='_blank'><button className='text-xs text-white bg-green-700 px-2 py-1.5 rounded ml-2'>Voir le produit</button></a></div>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-white p-6 rounded shadow-md">
                {error && <span className="text-center text-red-600">{error}</span>}
                {success && <span className="text-center text-green-600">{success}</span>}
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'évènement <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                {...register('title', { required: 'Le nom est requis' })}
                                className={`w-full px-2 py-1 border text-gray-700 rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de l'évènement <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                {...register('location', { required: 'Le lieu est requis' })}
                                className={`w-full px-2 py-1 border rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                {...register('slug')}
                                className={`w-full px-2 py-1 border hidden rounded ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type de produit</label>
                            <select
                                {...register('type')}
                                className={`w-full px-2 py-1 border rounded ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="simple">Unique</option>
                                {/* <option value="variable">Variable</option> */}
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                        </div>

                        <div className="mb-6">
                            <CategorieComp
                                categorieSelected={categorieSelected}
                                setCategorieSelected={setCategorieSelected}
                            />
                        </div>
                        {type !== 'variable' && (
                            <PrixProduitsComp
                                register={register}
                                errors={errors}
                                watch={watch}
                            />
                        )}

                        <div className="mb-4">
                            <MotCleComp
                                register={register}
                                errors={errors}
                                setValue={setValue}
                                tagsChoosed={tagsChoosed}
                                setTagsChoosed={setTagsChoosed}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full mt-6">
                    <DateBillerieComp
                        register={register}
                        errors={errors}
                    />
                    <div className="mb-6">
                        <label className="block font-medium mb-2 text-sm" htmlFor="short_description">
                            Description courte
                        </label>
                        {product ? (
                            <EditorComp Ref={shortDescriptionEditorRef} height={200} defaultvalue={product?.post_excerpt || null} />
                        ) : (
                            <EditorComp Ref={shortDescriptionEditorRef} height={200} defaultvalue={null} />
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium mb-2 text-sm" htmlFor="long_description">
                            Description
                        </label>
                        {product ? (
                            <EditorComp Ref={longDescriptionEditorRef} height={300} defaultvalue={product?.post_content || null} />
                        ) : (
                            <EditorComp Ref={longDescriptionEditorRef} height={300} defaultvalue={null} />
                        )}
                    </div>

                    <InventairesComp register={register} errors={errors} watch={watch} setValue={setValue} />

                    <DownloadBilletComp
                        billet={billet}
                        setBillet={setBillet}
                        errorBillet={errorBillet}
                        watch={watch}
                        typebillet={typebillet}
                        setTypeBillet={setTypeBillet}
                        focusTypebillet={focusTypebillet}
                        setFocusTypeBillet={setFocusTypeBillet} />

                    <SeoComp register={register} errors={errors} />

                    <div className="max-w-96">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select
                            {...register('status')}
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                        >
                            <option value="draft">Brouillon</option>
                            <option value="publish">Publié</option>
                            <option value="archived">Archivé</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            className={`mt-4 w-64 px-2 py-1 bg-purple-600 text-white rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loadFecth || isSubmitting}
                        >
                            {isSubmitting ? 'En cours...' : (<>{id ? 'Mettre à jour le produit' : 'Enregistrer le produit'}</>)}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}