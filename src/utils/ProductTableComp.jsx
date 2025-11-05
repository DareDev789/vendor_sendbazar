import OneLineProductComp from "./OneLineProductComp";
import { motion } from "framer-motion";

export default function ProductTableComp({ products = [], link, deleteProduit, selectedIds = [], setSelectedIds, onDuplicate, showAntigaspiIcon = false, showRubrique = false }) {
    const allSelected = products.length > 0 && selectedIds.length === products.length;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };
    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };
    return (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="font-semibold border-b text-gray-700">
                        <th className="px-2 py-2 border w-8 text-center">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={handleSelectAll}
                                className="accent-pink-500"
                            />
                        </th>
                        <th className="px-2 py-2 border w-24 text-center">Image</th>
                        <th className="px-2 py-2 border w-64 text-center">Nom</th>
                        <th className="px-2 py-2 border w-16 text-center">Statut</th>
                        {/* <th className="px-2 py-2 border w-32 text-center">Unité</th> */}
                        <th className="px-2 py-2 border w-24 text-center">Stock</th>
                        <th className="px-2 py-2 border w-14 text-center">Prix</th>
                        <th className="px-2 py-2 border w-16 text-center">Rubrique</th>
                        <th className="px-2 py-2 border w-20 text-center">Date</th>
                        <th className="px-2 py-2 border w-32 text-center">Adresses</th>
                    </tr>
                </thead>
                <tbody className="text-center divide-y divide-gray-100">
                    {products.map((product, index) => (
                        <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <OneLineProductComp
                                product={product}
                                link={link}
                                deleteProduit={deleteProduit}
                                checked={selectedIds.includes(product.id)}
                                onCheck={checked => handleSelectOne(product.id, checked)}
                                onDuplicate={onDuplicate}
                                showAntigaspiIcon={showAntigaspiIcon}
                                showRubrique={showRubrique}
                            />
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
