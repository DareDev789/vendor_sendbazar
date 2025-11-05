import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import EditorComp from '../../utils/EditorComp';

export default function InclusNonInclusCircuit({ inclusEditorRef, nonInclusEditorRef, inclusValue, nonInclusValue }) {
    return (
        <div className="my-6">
            <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
                <div className="mb-4">
                    <span className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full">
                        <FontAwesomeIcon icon={faCheck} className="mr-3" />
                        Inclus et Non Inclus
                        <span className="text-base font-normal text-gray-600 ml-2 self-center">
                            (Définir ce qui est inclus et non inclus dans le circuit)
                        </span>
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                        <div className="mb-3">
                            <span className="flex items-center text-green-600 text-lg font-semibold">
                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                Ce qui est inclus
                            </span>
                        </div>
                        <EditorComp Ref={inclusEditorRef} height={200} defaultvalue={inclusValue || ''} />
                    </div>
                    <div>
                        <div className="mb-3">
                            <span className="flex items-center text-red-600 text-lg font-semibold">
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                Ce qui n'est pas inclus
                            </span>
                        </div>
                        <EditorComp Ref={nonInclusEditorRef} height={200} defaultvalue={nonInclusValue || ''} />
                    </div>
                </div>
            </div>
        </div>
    );
}