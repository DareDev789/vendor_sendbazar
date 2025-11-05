export default function AttributComp({ register, errors }) {
    
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4 text-[#f6858b]">Attributs</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><b>Nom de l'attribut</b></label>
                    <input
                        type="text"
                        {...register('attribute_name')}
                        className={`w-full p-2 border rounded ${errors.attribute_name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.attribute_name && <p className="text-red-500 text-xs mt-1">{errors.attribute_name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><b>Valeur de l'attribut</b></label>
                    <input
                        type="text"
                        {...register('attribute_value')}
                        className={`w-full p-2 border rounded ${errors.attribute_value ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.attribute_value && <p className="text-red-500 text-xs mt-1">{errors.attribute_value.message}</p>}
                </div>
            </div>
        </div>
    );
}