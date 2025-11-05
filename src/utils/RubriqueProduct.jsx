export default function RubriqueProduct({ register }) {
    return (
        <div className="w-full p-2">
            <label htmlFor="rubrique" className="text-sm font-medium text-gray-700">Rubrique du produit</label>
            <select
                id="rubrique"
                {...register('rubrique')}
                className="p-2 border border-gray-300 rounded text-sm w-full"
            >
                <option value="">Produit standard</option>
                <option value="soins_et_beaute">Réservations des soins et beauté</option>
                <option value="prestations_services">Prestations des services</option>
                <option value="locations_vehicule">Location des véhicules</option>
            </select>
        </div>
    )
}