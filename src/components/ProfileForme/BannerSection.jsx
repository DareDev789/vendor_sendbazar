export default function BannerSection({ thumbnail, setThumbnail, setShowBannerSelector }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Image de la bannière</h2>
      <div className="w-full mb-4">
        {thumbnail && thumbnail.url ? (
          <div className="relative">
            <img
              src={thumbnail.url}
              alt="Bannière de la boutique"
              className="object-cover w-full h-64 border-2 border-gray-300 rounded-lg shadow-lg md:h-80 lg:h-96"
            />
            <button
              type="button"
              onClick={() => setThumbnail(null)}
              className="absolute flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
              title="Supprimer la bannière"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={() => setShowBannerSelector(true)}
            className="flex flex-col items-center justify-center w-full h-64 text-gray-500 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer md:h-80 lg:h-96 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="flex items-center justify-center w-20 h-20 mb-3 transition-colors bg-blue-100 rounded-full hover:bg-blue-200">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm font-medium">Aucune bannière sélectionnée</p>
            <p className="mt-1 text-xs text-gray-400">Cliquez sur le + pour sélectionner une image</p>
          </div>
        )}
      </div>
    </div>
  );
}
