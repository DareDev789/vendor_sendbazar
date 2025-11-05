import { faSuperpowers } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function SeoComp({ register, errors }) {
    return (
        <div className="mb-6 mt-4">
            <h1 className="text-2xl font-bold mb-4 text-[#f6858b]"><FontAwesomeIcon icon={faSuperpowers} className='mr-3'/> SEO</h1>
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><b>Titre SEO</b></label>
                    <input
                        type="text"
                        defaultValue={'%%title%% %%sep%% %%sitename%%'}
                        {...register('seo_title')}
                        className={`w-full p-2 text-gray-700 border rounded ${errors.seo_title ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.seo_title && <p className="text-red-500 text-xs mt-1">{errors.seo_title.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"><b>Description SEO</b></label>
                    <textarea
                        {...register('seo_description')}
                        className={`w-full p-2 text-gray-700 border rounded ${errors.seo_description ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.seo_description && <p className="text-red-500 text-xs mt-1">{errors.seo_description.message}</p>}
                </div>
            </div>
        </div>
    );
}