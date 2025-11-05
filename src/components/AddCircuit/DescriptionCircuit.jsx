import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import EditorComp from '../../utils/EditorComp';

export default function DescriptionCircuit({ descriptionEditorRef, setValue, value }) {
    return (
        <div className="my-6 z-10">
            <div className="mb-6 mt-4 border border-gray-300 rounded-lg p-4 shadow-sm">
                <div className="mb-4">
                    <span className="flex items-center text-[#f6858b] text-2xl font-bold mb-4 w-full">
                        <FontAwesomeIcon icon={faWrench} className="mr-3" />
                        Description du circuit
                        <span className="text-base font-normal text-gray-600 ml-2 self-center">
                            (Définir la description du circuit)
                        </span>
                    </span>
                </div>
                <div className="grid grid-cols-1 w-full">
                    <EditorComp Ref={descriptionEditorRef} height={200} defaultvalue={value || ''} />
                </div>
            </div>
        </div>
    );
}