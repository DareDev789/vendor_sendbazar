// EditorComp.jsx
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useEffect, useRef } from 'react';

export default function EditorComp({ Ref, height = 200, defaultvalue = '' }) {
    const editorRef = useRef();

    useEffect(() => {
        if (Ref) {
            Ref.current = editorRef.current;
        }
    }, [Ref]);

    return (
        <div style={{ border: '1px solid #ccc' }}>
            <CKEditor
                editor={ClassicEditor}
                data={defaultvalue}
                onReady={editor => {
                    editorRef.current = editor;
                    if (Ref) Ref.current = editor;
                }}
                config={{
                    toolbar: [
                        'bold', 'italic', 'fontColor', 'fontBackgroundColor', '|',
                        'alignment:left', 'alignment:center', 'alignment:right', 'alignment:justify', '|',
                        'bulletedList', 'numberedList', '|',
                        'insertTable', '|',
                        'undo', 'redo'
                    ],
                    alignment: {
                        options: ['left', 'center', 'right', 'justify']
                    },
                    table: {
                        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                    },
                }}
            />
            <style>{`
                .ck-editor__editable_inline {
                    min-height: ${height}px;
                    max-height: ${height}px;
                    overflow-y: auto;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 16px;
                    color: #212121;
                    padding: 10px;
                    line-height: 1.6;
                }
                
                .ck-editor__editable_inline::-webkit-scrollbar {
                    width: 8px;
                }
                
                .ck-editor__editable_inline::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                
                .ck-editor__editable_inline::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                
                .ck-editor__editable_inline::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }
                
                .ck-editor__editable_inline:focus {
                    outline: none;
                    border: 2px solid #f6858b;
                    box-shadow: 0 0 0 2px rgba(246, 133, 139, 0.2);
                }
                
                .ck-editor__editable_inline p {
                    margin: 0 0 10px 0;
                }
                
                .ck-editor__editable_inline ul, 
                .ck-editor__editable_inline ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                
                .ck-editor__editable_inline table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 10px 0;
                }
                
                .ck-editor__editable_inline table td,
                .ck-editor__editable_inline table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                
                .ck-editor__editable_inline table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
}
