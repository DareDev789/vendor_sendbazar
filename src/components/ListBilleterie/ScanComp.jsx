import { Capacitor } from '@capacitor/core';
import ScanBilletNative from './ScanBilletNative';
import ScannerBilletWeb from './ScannerBilletWeb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLineChart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function ScanComp() {
    const isNative = Capacitor.isNativePlatform();
    const navigate = useNavigate();

    return (
        <>
            <div className='mb-4'>
                <button
                    className="bg-[#f6858b] text-white px-4 py-2 text-sm rounded hover:bg-blue-600 transition-colors duration-300"
                    onClick={() => navigate("/billeterie/stat")}
                >
                    <FontAwesomeIcon icon={faLineChart} className="mr-1" /> Statistique de scan
                </button>
            </div>
            {isNative ? (<ScanBilletNative />) : (<ScannerBilletWeb />)}
        </>
    )
}