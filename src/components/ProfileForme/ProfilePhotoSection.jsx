export default function ProfilePhotoSection({ photo, setPhoto, setShowProfileSelector }) {
  return (
    <div className="relative">
      <div className="relative mb-6 ml-6 -mt-24">
        {photo && (photo.url || typeof photo === 'string') ? (
          <div className="relative">
            <img
              src={typeof photo === 'string' ? photo : photo.url}
              alt="Photo de profil"
              className="object-cover w-40 h-40 border-4 border-white rounded-full shadow-lg"
            />
            <button
              type="button"
              onClick={() => setPhoto("")}
              className="absolute flex items-center justify-center w-6 h-6 text-sm text-white transition-colors bg-red-500 rounded-full -top-1 -right-1 hover:bg-red-600"
              title="Supprimer la photo"
            >
              ×
            </button>
          </div>
        ) : (
          <div
            onClick={() => setShowProfileSelector(true)}
            className="flex items-center justify-center w-40 h-40 text-gray-500 transition-colors border-2 border-gray-300 border-dashed rounded-full shadow-lg cursor-pointer bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          >
            <div className="flex items-center justify-center w-20 h-20 transition-colors bg-blue-100 rounded-full hover:bg-blue-200">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
