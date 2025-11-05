import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { url } from '../../contextes/UrlContext';
import nProgress from "nprogress";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ClipLoader from 'react-spinners/ClipLoader';
import TableauActionGroup from "../../utils/TableauActionGroup";
import PaginationProduct from "../../utils/PaginationProduct";
import FiltreAnnonces from "../../utils/FiltreAnnonces";
//api/get_all_communique

export default function IndexAnnonces() {
    const token = localStorage.getItem('token');
    const { page } = useParams();
    const location = useLocation();
    const link = '/annonces/';
    const [ongletActif, setOngletActif] = useState('Toutes');
    const [annonces, setAnnonces] = useState([]);
    const [rawAnnonces, setRawAnnonces] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1 });
    const [load, setLoad] = useState(false);

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
            } else {
                couponPrice = getVal('Coupon Price');
            }
            return {
                couponType: getVal('Coupon Type'),
                couponCode: getVal('Coupon Code'),
                couponPrice,
                expirationDate: getVal('Date d’expiration') || getVal('Date d\u2019expiration') || getVal('Expiration Date')
            };
        } catch (e) {
            return { couponType: '', couponCode: '', couponPrice: '', expirationDate: '' };
        }
    };
    const extractPlainTextFromHtml = (html) => {
        try {
            const div = document.createElement('div');
            div.innerHTML = html || '';
            return div.textContent.replace(/\s+/g, ' ').trim();
        } catch (_) {
            return '';
        }
    };
    const truncateText = (text, max = 160) => {
        if (!text) return '';
        if (text.length <= max) return text;
        return text.slice(0, max).trim() + '...';
    };
    const normalizeAnnonceItem = (item) => {
        if (item && typeof item === 'object' && 'titre' in item && 'coupon_type' in item) {
            return item;
        }
        const post = item?.post || {};
        const { couponType, couponCode, couponPrice, expirationDate } = parseFieldsFromHtml(post.post_content || '');
        const description = extractPlainTextFromHtml(post.post_content || '');
        return {
            id: item?.id,
            status: item?.status || 'unread',
            titre: post?.post_title ?? '',
            coupon_type: couponType,
            coupon_code: couponCode,
            coupon_price: couponPrice,
            expiration_date: expirationDate,
            date: (post?.post_date || '').split(' ')[0] || '',
            contenu: post?.post_content ?? '',
            description,
            lien: post?.guid ?? '#',
        };
    };
    const normalizeAnnonceList = (list) => Array.isArray(list) ? list.map(normalizeAnnonceItem) : [];

    const fetchAnnonces = async () => {
        setLoad(true);
        let apiLink;
        if (page) {
            apiLink = `${url}/get_all_communique?page=${page}`;
        } else {
            apiLink = `${url}/get_all_communique`;
        }
        try {
            nProgress.start();
            const response = await axios.get(apiLink, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const list = (response.data?.annoucement?.data || []).map((item) => {
                const { couponType, couponCode, couponPrice, expirationDate } = parseFieldsFromHtml(item.post?.post_content || '');
                const description = extractPlainTextFromHtml(item.post?.post_content || '');
                return {
                    id: item.id,
                    status: item.status || 'unread',
                    titre: item.post?.post_title ?? '',
                    coupon_type: couponType,
                    coupon_code: couponCode,
                    coupon_price: couponPrice,
                    expiration_date: expirationDate,
                    date: item.post?.post_date?.split(' ')[0] || '',
                    contenu: item.post?.post_content ?? '',
                    description,
                    lien: item.post?.guid ?? '#'
                };
            });
            setRawAnnonces(list);
            setAnnonces(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
            const current = response.data?.annoucement?.current_page || 1;
            const last = response.data?.annoucement?.last_page ?? 10;
            setPagination({ currentPage: Number(current) || 1, lastPage: Number(last) || 10 });

        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoad(false);
            nProgress.done();
        }
    };
    useEffect(() => {
        const sp = new URLSearchParams((location.search || '').replace(/^\?/, ''));
        const hasFilters = Boolean(sp.get('titre') || sp.get('status') || sp.get('dateStart') || sp.get('dateEnd'));
        if (hasFilters) {
            return;
        }
        fetchAnnonces();
    }, [page, location.key, location.search]);

    const getTabs = () => {
        const all = annonces;
        const lues = annonces.filter(a => (a.status || '').toLowerCase() === 'read');
        const nonLues = annonces.filter(a => (a.status || '').toLowerCase() === 'unread');
        return [
            { key: 'Toutes', label: `Toutes (${all.length})` },
            { key: 'Lue', label: `Lue (${lues.length})` },
            { key: 'Non lue', label: `Non lue (${nonLues.length})` },
        ];
    };
    const onglets = getTabs();
    const annoncesAffichees = ongletActif === 'Toutes'
        ? annonces
        : annonces.filter(a => {
            const s = (a.status || '').toLowerCase();
            return (ongletActif === 'Lue' && s === 'read') || (ongletActif === 'Non lue' && s === 'unread');
        });

    const statutCouleurs = {
        'Lue': 'bg-green-500',
        'Non lue': 'bg-yellow-500',
    };

    const colonnes = [
        { key: 'titre', label: 'Titre', thClassName: 'w-1/4', tdClassName: 'truncate' },
        {
            key: 'description',
            label: 'Description',
            thClassName: 'w-1/2 sm:w-2/3',
            tdClassName: 'truncate text-gray-600',
            render: (item) => (
                <span className="block truncate" title={extractPlainTextFromHtml(item.contenu || item.description || '')}>
                    {truncateText(extractPlainTextFromHtml(item.contenu || item.description || ''), 120)}
                </span>
            )
        },
        {
            key: 'action',
            label: 'Action',
            thClassName: 'w-20',
            tdClassName: '',
            render: (item) => {
                const sp = new URLSearchParams((location.search || '').replace(/^\?/, ''));
                if (ongletActif !== 'Toutes') {
                    sp.set('onglet', ongletActif);
                } else {
                    sp.delete('onglet');
                }
                const searchStr = sp.toString();
                const toHref = searchStr ? `/annonce-detail/${item.id}?${searchStr}` : `/annonce-detail/${item.id}`;
                return (
                    <Link
                        to={toHref}
                        className="text-pink-600 hover:underline"
                    >
                        Voir
                    </Link>
                );
            }
        }
    ];

    const actionOptions = [
        { value: 'delete', label: 'Supprimer' },
        { value: 'mark_read', label: 'Marquer comme lue' },
    ];

    const onApplyAction = async (action, ids) => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            if (action === 'delete') {
                await axios.delete(`${url}/communicate/bulk-delete`, { data: { annonces_ids: ids }, headers });
            }
            if (action === 'mark_read') {
                await axios.post(`${url}/communicate/bulk-read`, { annonces_ids: ids }, { headers });
            }
            await fetchAnnonces();
        } catch (e) {
            console.error('[IndexAnnonces] onApplyAction error', e);
        }
    };

    return (
        <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h1 className="text-2xl font-bold mb-6">Communiqués</h1>
            <motion.div className="overflow-x-auto mb-6">
                <div className="flex gap-2 border-b pb-2">
                    {onglets.map(({ label, key }) => (
                        <motion.button
                            key={key}
                            className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${ongletActif === key
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            onClick={() => setOngletActif(key)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
            <FiltreAnnonces
                currentPage={pagination.currentPage}
                displayedData={annonces}
                rawData={rawAnnonces}
                selectedIds={selectedIds}
                onFiltrer={(liste, current, last) => {
                    const normalized = normalizeAnnonceList(liste);
                    setRawAnnonces(normalized);
                    setAnnonces(normalized);
                    if (current) setPagination(p => ({ ...p, currentPage: current }));
                    if (last) setPagination(p => ({ ...p, lastPage: last }));
                }}
                onPaginationChange={({ currentPage: cp, lastPage: lp }) => {
                    if (cp) setPagination(p => ({ ...p, currentPage: cp }));
                    if (lp) setPagination(p => ({ ...p, lastPage: lp }));
                }}
                onApplyAction={onApplyAction}
                onLoadingChange={(isLoading) => setLoad(Boolean(isLoading))}
            />
            <AnimatePresence mode="wait">
                {load ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full py-16 flex items-center justify-center"
                    >
                        <ClipLoader color="#ec4899" size={42} />
                    </motion.div>
                ) : (
                    <motion.div
                        key={`list-${ongletActif}-${pagination.currentPage}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <TableauActionGroup
                            colonnes={colonnes}
                            donnees={annoncesAffichees}
                            actionOptions={actionOptions}
                            onApplyAction={onApplyAction}
                            onSelectedIdsChange={setSelectedIds}
                            hideActions={true}
                            getRowClassName={(item) => (String(item.status || '').toLowerCase() === 'read' ? 'bg-white hover:bg-gray-50' : 'bg-rose-50 hover:bg-rose-100')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="mt-6">
                <PaginationProduct
                    link={link}
                    currentPage={pagination.currentPage}
                    lastPage={pagination.lastPage}
                />
            </div>
        </motion.div>
    );
}
