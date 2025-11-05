export default function DateBillerieComp({ register, errors }) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de l'évènement <span className="text-red-500">*</span></label>
                    <input
                        type="datetime-local"
                        {...register('date_event', { required: 'La date de l\'évènement est requise' })}
                        className={`w-full p-2 border rounded ${errors.date_event ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.date_event && <p className="text-red-500 text-xs mt-1">{errors.date_event.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date fermeture de la vente des billets<span className="text-red-500">*</span></label>
                    <input
                        type="datetime-local"
                        {...register('end_date_vente', { required: 'La date de fermeture de la vente est requise' })}
                        className={`w-full p-2 border rounded ${errors.end_date_vente ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.end_date_vente && <p className="text-red-500 text-xs mt-1">{errors.end_date_vente.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure d'ouverture du guichet <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-500">Les billets seront valides à partir de cette heure</span>
                    <input
                        type="datetime-local"
                        {...register('time_ouverture_guichet', { required: 'L\'heure d\'ouverture du guichet est requise' })}
                        className={`w-full p-2 border rounded ${errors.time_ouverture_guichet ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.time_ouverture_guichet && <p className="text-red-500 text-xs mt-1">{errors.time_ouverture_guichet.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fermeture du guichet <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-500">Les billets ne seront plus valides à partir de cette heure</span>
                    <input
                        type="datetime-local"
                        {...register('time_fermeture_guichet', { required: 'L\'heure de fermeture du guichet est requise' })}
                        className={`w-full p-2 border rounded ${errors.time_fermeture_guichet ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.time_fermeture_guichet && <p className="text-red-500 text-xs mt-1">{errors.time_fermeture_guichet.message}</p>}
                </div>
            </div>
        </div>
    );
}