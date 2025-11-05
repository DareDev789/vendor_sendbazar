import { faCube } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { url } from '../contextes/UrlContext';
import { url_frontend } from '../contextes/UrlContext';

export default function InventairesComp({ register, errors, watch, setValue, is_circuit = false }) {
    const manageStock = watch('manage_stock');
    const stock_unit = watch('stock_unit');
    const [verifUgs, setVerifUgs] = useState(false);
    const validateStockUnit = async (stock_unit) => {
        try {
            const response = await fetch(`${url}/verifUGs?value=${encodeURIComponent(stock_unit)}`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return data.IsNotExist || "Cet UGS existe déjà";
        } catch (err) {
            return "Erreur de vérification UGS";
        }
    };
    const resetBlockInventory = () => {
        if (!manageStock) {
            setValue('inventory', '');
            setValue('min_inventory', '');
            setValue('allow_backorders', 'no');
            setValue('stock_status', 'instock');
        }
    };
    useEffect(() => {
        resetBlockInventory();
        if (is_circuit) {
            setValue('allow_backorders', 'no');
            setValue('stock_status', 'instock');
        }
    }, [manageStock, is_circuit, setValue]);
    return (
        <div className="mb-6">
            <div>
                <h1 className="text-2xl font-bold mb-4 text-[#f6858b] flex items-center">
                    <FontAwesomeIcon icon={faCube} className="mr-2" />
                    Inventaires
                    <span className="text-base font-normal text-gray-600 ml-2">
                        Configurez l’inventaire de ce produit
                    </span>
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <b>Unité de stock</b> (Unité de Gestion des Stocks)
                        </label>
                        <input
                            type="text"
                            {...register('stock_unit', { required: 'UGS est requis' })}
                            className={`w-full p-2 border text-gray-700 rounded ${errors.stock_unit ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.stock_unit && <p className="text-red-500 text-xs mt-1">{errors.stock_unit.message}</p>}
                    </div>
                </div>
            </div>
            <div className="mt-4 mb-6">
                <label className="text-sm font-medium text-gray-700">
                    <input
                        type="checkbox"
                        {...register('manage_stock')}
                        className="mr-3 text-gray-700"
                    />
                    {is_circuit ? 'Activer les nombres de personne au niveau du circuit' : 'Activer la gestion de stock au niveau des produits'}
                </label>
            </div>
            {manageStock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <b>{is_circuit ? "Nombre de personnes maximum" : "Inventaire"}</b>
                            {is_circuit ? "" : " (Quantité en stock)"} {is_circuit ? <span className="text-red-500">*</span> : ''}
                        </label>
                        <input
                            type="number"
                            step="1"
                            {...register('inventory', { required: 'L\'inventaire est requis' })}
                            className={`w-full p-2 text-gray-700 border rounded ${errors.inventory ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.inventory && <p className="text-red-500 text-xs mt-1">{errors.inventory.message}</p>}
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <b>{is_circuit ? "Nombre de personnes minimum" : "Inventaire minimum"}</b> 
                            {is_circuit ? "" : " (Quantité minimale en stock)"}
                        </label>
                        <input
                            type="number"
                            {...register('min_inventory')}
                            className={`w-full p-2 text-gray-700 border rounded ${errors.min_inventory ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.min_inventory && <p className="text-red-500 text-xs mt-1">{errors.min_inventory.message}</p>}
                    </div>
                    {!is_circuit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Autoriser les commandes sur un produit en rupture de stock <span className="text-red-500">*</span>  </label>
                        <select
                            {...register('allow_backorders')}
                            className={`w-full p-2 text-gray-700 border rounded ${errors.allow_backorders ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="no">Non</option>
                            <option value="yes">Oui</option>
                        </select>
                        {errors.allow_backorders && <p className="text-red-500 text-xs mt-1">{errors.allow_backorders.message}</p>}
                    </div>
                    )}

                    {!is_circuit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <b>Statut du stock</b>
                        </label>
                        <select
                            {...register('stock_status', { defaultValue: 'instock' })}
                            className={`w-full p-2 border text-gray-700 rounded ${errors.stock_status ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="instock">En stock</option>
                            <option value="outofstock">Rupture de stock</option>
                        </select>
                        {errors.stock_status && <p className="text-red-500 text-xs mt-1">{errors.stock_status.message}</p>}
                    </div>
                    )}
                </div>
            )}
        </div>
    );
}