import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { url } from '../../contextes/UrlContext';
import nProgress from "nprogress";
//get_one_communique/{id}
export default function AnnonceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [load, setLoad] = useState(false);
    const [detail, setDetail] = useState(null);

    const parseFieldsFromHtml = (html) => {
        try {
            const div = document.createElement('div');
            div.innerHTML = html || '';
            const texts = Array.from(div.querySelectorAll('p')).map(p => p.textContent.trim());
            const getVal = (label) => {
                const row = texts.find(t => t.toLowerCase().startsWith(label.toLowerCase()));
                if (!row) return '';
                const parts = row.split(':');
                return (parts.slice(1).join(':') || '').trim();
            };
            const couponPriceNode = Array.from(div.querySelectorAll('p')).find(p => p.innerHTML.includes('woocommerce-Price-amount'));
            let couponPrice = '';
            
            if (couponPriceNode) {
                couponPrice = couponPriceNode.textContent.replace(/\s+/g, ' ').trim();  
                // console.log(couponPrice);
                 
                const cppr = couponPrice.replace(/[^\d,.-]/g, '').replace(',', '.');
                // console.log(cppr);
                // const formated = formatPrice(calculatePricetoNewDevise(cppr, 'Eur' , devise), listDevise[devise])
                // console.log(formated);
                
                
            } else {
                couponPrice = getVal('Coupon Price');
            }
            return {
                couponType: getVal('Coupon Type'),
                couponCode: getVal('Coupon Code'),
                couponPrice,
                couponDeductFrom: getVal('Coupon Price Deduct From'),
                utilisationLimite: getVal('Utilisation / Limite'),
                expirationDate: getVal('Date d’Expiration') || getVal('Date d\u2019expiration') || getVal('Date d’expiration') || getVal('Expiration Date')
            };
        } catch (e) {
            return { couponType: '', couponCode: '', couponPrice: '', couponDeductFrom: '', utilisationLimite: '', expirationDate: '' };
        }
    };

    useEffect(() => {
        const fetchAnnonce = async () => {
            setLoad(true);
            let link;
            if (id) {
                link = `${url}/get_one_communique/${id}`;
            }
            try {
                nProgress.start();
                const response = await axios.get(link, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = response.data?.annoucement || response.data || {};
                const title = data?.post?.post_title || '';
                const contentHtml = data?.post?.post_content || '';
                const fields = parseFieldsFromHtml(contentHtml);
                setDetail({
                    title,
                    ...fields
                });
            } catch (error) {
            } finally {
                setLoad(false);
                nProgress.done();
            }
        };
        fetchAnnonce();
    }, [id]);

    return (
        <div className="mx-auto bg-white p-6 rounded-2xl shadow">
            {load && (
                <div className="w-full py-16 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full" />
                </div>
            )}
            {!load && !detail && (
                <div className="p-4 text-center text-red-600 text-xl">
                    Annonce non trouvée.
                </div>
            )}
            {!load && detail && (
                <>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">{detail.title}</h1>
                    <div className="text-gray-800 leading-7 whitespace-pre-line">
                        {`Coupon Type: ${detail.couponType || '–'}\n\n`}
                        {`Coupon Code: ${detail.couponCode || '–'}\n\n`}
                        {`Coupon Price: ${detail.couponPrice || '–'}\n\n`}
                        {`Coupon Price Deduct From: ${detail.couponDeductFrom || '–'}\n\n`}
                        {`Utilisation / Limite: ${detail.utilisationLimite || '–'}\n\n`}
                        {`Date d’expiration: ${detail.expirationDate || '–'}`}
                    </div>
                </>
            )}
            <div className="mt-8">
                <button
                    onClick={() => {
                        // Si on a des query params, on retourne à la liste avec ces filtres
                        const search = window.location.search;
                        if (search) {
                            // On enlève l'id de l'annonce du path et on retourne à /annonces avec les params
                            const params = new URLSearchParams(search);
                            // On retire les params spécifiques à l'annonce si besoin
                            navigate(`/annonces${search}`);
                        } else {
                            navigate('/annonces');
                        }
                    }}
                    className="text-blue-600 text-base hover:underline"
                >
                    ← Retour
                </button>
            </div>
        </div>
    );
}
