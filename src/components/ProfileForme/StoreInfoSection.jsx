export default function StoreInfoSection({ form, handleChange, countryNames }) {
  return (
    <>
      <div>
        <label className="text-xl font-bold">Nom de la boutique</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <h1 className="text-2xl font-bold">Adresse :</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="rue1"
          value={form.rue1}
          onChange={handleChange}
          placeholder="Rue 1"
          className="p-2 border rounded"
        />
        <input
          name="rue2"
          value={form.rue2}
          onChange={handleChange}
          placeholder="Rue 2"
          className="p-2 border rounded"
        />
        <input
          name="ville"
          value={form.ville}
          onChange={handleChange}
          placeholder="Ville"
          className="p-2 border rounded"
        />
        <input
          name="codePostal"
          value={form.codePostal}
          onChange={handleChange}
          placeholder="Code postal"
          className="p-2 border rounded"
        />
        <select
          name="pays"
          value={form.pays}
          onChange={handleChange}
          className="w-full col-span-2 p-2 border rounded"
        >
          <option value="">-- Pays --</option>
          {countryNames.map((paysNom, i) => (
            <option key={i} value={paysNom}>
              {paysNom}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xl font-bold">Téléphone</label>
        <input
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
    </>
  );
}
