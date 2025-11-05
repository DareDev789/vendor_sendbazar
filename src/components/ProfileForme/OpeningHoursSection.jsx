export default function OpeningHoursSection({
  showHoraires,
  handleHorairesToggle,
  form,
  toggleJourOuvert,
  addPlageHoraire,
  updatePlageHoraire,
  removePlageHoraire,
  jours,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 mb-2 text-sm font-semibold">
        <input
          type="checkbox"
          checked={showHoraires}
          onChange={(e) => handleHorairesToggle(e.target.checked)}
        />
        Horaire du magasin
      </label>
      {showHoraires && (
        <div className="space-y-2">
          {jours.map((jour) => (
            <div key={jour} className="p-4 mb-2 border rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{jour}</span>
                <label className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium">
                    {form.horaires[jour].isOpen ? "Ouvert" : "Fermé"}
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.horaires[jour].isOpen}
                      onChange={() => toggleJourOuvert(jour)}
                      className="sr-only peer"
                    />
                    <div className="h-6 transition-colors duration-300 bg-gray-300 rounded-full w-11 peer-checked:bg-green-500"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
              {form.horaires[jour].isOpen && (
                <div className="space-y-2">
                  {form.horaires[jour].plages.map((plage, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={plage.debut}
                        onChange={(e) =>
                          updatePlageHoraire(jour, index, "debut", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={plage.fin}
                        onChange={(e) =>
                          updatePlageHoraire(jour, index, "fin", e.target.value)
                        }
                        className="p-1 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removePlageHoraire(jour, index)}
                        className="px-2 py-1 ml-2 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                        title="Supprimer cette plage"
                        aria-label="Supprimer cette plage"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPlageHoraire(jour)}
                    className="text-sm text-blue-600 underline"
                  >
                    + Ajouter une plage d'heure
                  </button>
                </div>
              )}
            </div>
          ))}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mt-5">
              <label className="block mb-1 text-sm font-semibold">
                Avis d'ouverture de la boutique
              </label>
              <input
                type="text"
                name="avisOuverture"
                value={form.avisOuverture || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="La boutique est ouverte"
              />
            </div>
            <div className="mt-5">
              <label className="block mb-1 text-sm font-semibold">
                Avis de fermeture de la boutique
              </label>
              <input
                type="text"
                name="avisFermeture"
                value={form.avisFermeture || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Boutique fermée"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
