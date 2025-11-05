import { QRCodeCanvas } from "qrcode.react";
import FormatDateTime from "./FormatDateTime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import headerImage from '../assets/header-sendbazar1-1.webp';

export default function TicketDesign1({ billet, removeImage, qrValue, watch, billetBDD, setBillet, setShowCropper }) {
    const name = watch('title');
    const date_event = watch('date_event');
    const location = watch('location');
    const price = watch('price');
    const sale_price = watch('sale_price');
    return (

        <>
            <div className="relative w-[500px] aspect-[9/14] rounded-lg overflow-hidden shadow-lg bg-gray-100">
                <img
                    src={billet.url}
                    alt="Billet"
                    className="w-full aspect-[16/4]  object-cover"
                />
                <div className="flex items-center border-b-2">
                    <div className="p-2">
                        <QRCodeCanvas value={qrValue} size={128} />
                    </div>
                    <div className="p-2 w-full">
                        <h2 className="text-center font-bold text-2xl">{name}</h2>
                        <p className="text-center font-semibold text-sm capitalize"><FormatDateTime dateString={date_event} /> </p>
                    </div>
                </div>
                <p className="px-3 mt-10 text-center"><b>Lieu :</b> {location}</p>
                <div className="flex w-full p-4">
                    <div className="w-[50%]">
                        <h2 className="text-left font-bold text-lg">Nom du client</h2>
                        <p className="text-left font-semibold text-sm capitalize mt-6"><b>Prévente limite :</b><br /> <FormatDateTime dateString={date_event} /> </p>
                        <p className="text-left font-semibold text-sm capitalize mt-4"><b>Commande N° : </b>N/A </p>
                        <p className="text-left font-semibold text-sm capitalize"><b>Date : </b>xx xx xxxx </p>
                        <p className="text-left font-semibold text-sm capitalize"><b>Nom : </b>Nom du client </p>
                        <p className="text-left font-semibold text-sm capitalize"><b>Prix TTC : </b>{sale_price || price}{" €"} </p>
                    </div>
                    <div className="w-[50%]">
                        <h2 className="text-center font-bold text-md">N° 24</h2>
                        <p className="text-sm capitalize text-center"><i>N'imprimez pas deux fois le même billet</i></p>
                        <p className="text-left font-semibold text-sm capitalize mt-4"><b>Conditions générales de vente : </b></p>
                        <p className="text-left font-semibold text-sm text-[#f6858b]">https://sendbazar.com/fr/conditions-generales-de-vente</p>
                        <p className="text-left font-semibold text-sm capitalize mt-4">Pour toutes questions, contacter <code>Nom de la boutique</code></p>
                        <p className="text-sm capitalize">*** ** *** ***</p>
                        <p className="text-sm capitalize">emailboutique@email.com</p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full items-center flex bg-gray-200">
                    <img src={headerImage} />
                </div>
                <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                {!billetBDD && (
                    <button
                        type="button"
                        onClick={(e)=> {setBillet(null); setShowCropper(true)}}
                        className="absolute top-2 left-2 p-2 px-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                        <FontAwesomeIcon icon={faEdit} className="h-4" />
                    </button>
                )}
            </div>
        </>
    )
}