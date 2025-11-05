import { useDevise } from "../contextes/DeviseContext";
export default function PrixProduitsComp({ register, errors, watch }) {
    const { devise, listDevise } = useDevise();
    const regular_price = watch('regular_price');
    const salePrice = watch('sale_price');

    if (regular_price && salePrice && parseFloat(salePrice) >= parseFloat(regular_price)) {
        errors.sale_price = {  
            type: 'manual',
            message: 'Le prix réduit doit être inférieur au prix normal.'
        }; 
    }
    if (salePrice && parseFloat(salePrice) < 0) {
        errors.sale_price = {
            type: 'manual',
            message: 'Le prix réduit ne peut pas être négatif.'
        };
    }
    if (regular_price && parseFloat(regular_price) < 0) {
        errors.regular_price = {
            type: 'manual',
            message: 'Le prix ne peut pas être négatif.'
        };
    }
    if (regular_price && parseFloat(regular_price) < parseFloat(salePrice)) {
        errors.sale_price = {
            type: 'manual',
            message: 'Le prix réduit doit être inférieur au prix normal.'
        };
    }

    return (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2">
            <div className="px-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix <span className="text-red-500">*</span></label>
                <div className="relative flex items-center w-full ">
                    <div className="absolute left-2 font-bold text-gray-700">
                        {listDevise[devise]}
                    </div>
                    <div className="w-full">
                        <input
                            type="number"
                            step="any"
                            {...register('regular_price', { required: 'Le prix est requis' })}
                            className={`w-full p-2 pl-8 border rounded ${errors.regular_price ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                {errors.regular_price && <p className="text-red-500 text-xs mt-1">{errors.regular_price.message}</p>}
            </div>
            <div className="px-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix reduit</label>
                <div className="relative flex items-center w-full">
                    <div className="absolute left-2 font-bold text-gray-700">
                        {listDevise[devise]}
                    </div>
                    <div className="w-full">
                        <input
                            type="number"
                            step="any"
                            {...register('sale_price')}
                            className={`w-full p-2 pl-8 border rounded ${errors.sale_price ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder='0.00'
                        />
                    </div>
                </div>
                {errors.sale_price && <p className="text-red-500 text-xs mt-1">{errors.sale_price.message}</p>}
            </div>
        </div>
    );
}
