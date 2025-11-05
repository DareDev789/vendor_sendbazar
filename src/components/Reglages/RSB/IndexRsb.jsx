import { useState } from "react";

export default function IndexRsb() {
  const [form, setForm] = useState({
    titre: '',
    metaDescription: '',
    motsCles: '',
    titreFacebook: '',
    descriptionFacebook: '',
    imageFacebook: null,
    titreTwitter: '',
    descriptionTwitter: '',
    imageTwitter: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = new FormData();
    for (const key in form) {
      data.append(key, form[key]);
    }

    
  };

  return (
    <div className="p-4 mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Référencement (SEO) de la boutique</h1>
        <a
          href="#"
          className="mt-2 md:mt-0 inline-block px-4 py-2 text-base font-medium text-white bg-gray-400 rounded hover:bg-gray-800 transition"
        >
          Voir boutique
        </a>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto p-6 shadow rounded space-y-6">
        
        <div>
          <label className="block text-sm font-semibold mb-1">Référencement | Titre :</label>
          <input type="text" name="titre" value={form.titre} onChange={handleChange}
            className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Méta Description :</label>
          <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange}
            className="w-full p-2 border rounded" rows={3}></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Mots-clés (séparés par des virgules) :</label>
          <input type="text" name="motsCles" value={form.motsCles} onChange={handleChange}
            className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Titre Facebook :</label>
          <input type="text" name="titreFacebook" value={form.titreFacebook} onChange={handleChange}
            className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description Facebook :</label>
          <textarea name="descriptionFacebook" value={form.descriptionFacebook} onChange={handleChange}
            className="w-full p-2 border rounded" rows={3}></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Image pour Facebook :</label>
          <input type="file" name="imageFacebook" accept="image/*" onChange={handleFileChange}
            className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Titre Twitter :</label>
          <input type="text" name="titreTwitter" value={form.titreTwitter} onChange={handleChange}
            className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description Twitter :</label>
          <textarea name="descriptionTwitter" value={form.descriptionTwitter} onChange={handleChange}
            className="w-full p-2 border rounded" rows={3}></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Image pour Twitter :</label>
          <input type="file" name="imageTwitter" accept="image/*" onChange={handleFileChange}
            className="w-full p-2 border rounded" />
        </div>

        <div className="text-right">
          <button type="submit" className="px-4 py-2 bg-[#f6858b] text-white rounded hover:bg-pink-700 transition">
            Sauvegarder les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
