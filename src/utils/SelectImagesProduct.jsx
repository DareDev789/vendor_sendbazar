import {
  faCheckCircle,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Notiflix from "notiflix";
import { useEffect, useRef, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import ClipLoader from "react-spinners/ClipLoader";
import { url } from "../contextes/UrlContext";
import nProgress from "nprogress";
import axios from "axios";

export default function SelectImagesProduct({
  setShowMap,
  showMap,
  selecteOne = false,
  setGallery = [],
  setThumbnail,
}) {
  const popupRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [choose, setChoose] = useState("upload");
  const [newDataImages, setNewDataImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [altTexts, setAltTexts] = useState({});

  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 20;
  const token = localStorage.getItem("token");

  const getAllConf = async () => {
    try {
      nProgress.start();
      const response = await axios.get(`${url}/mesimages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const data = response.data;
        const sorted = data.sort((a, b) => b.id - a.id);
        setImages(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      nProgress.done();
    }
  };

  useEffect(() => {
    getAllConf();
  }, []);

  useEffect(() => {
    const searchTerm = search.toLowerCase();

    const sortedImages = [...images].sort((a, b) => b.id - a.id);

    if (searchTerm.trim() !== "") {
      const results = sortedImages.filter((img) =>
        img.alt?.toLowerCase().includes(searchTerm)
      );
      setFilteredImages(results);
    } else {
      setFilteredImages(sortedImages);
    }

    setCurrentPage(1);
  }, [search, images]);

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages?.slice(
    indexOfFirstImage,
    indexOfLastImage
  );
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowMap(false);
      }
    }

    if (showMap) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMap]);

  const compressImage = async (file, maxWidth = 800, quality = 0.7) => {
    if (
      file.type === "image/svg+xml" ||
      file.type === "image/avif" ||
      file.size < 500000
    ) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const ratio = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          if (file.type === "image/png") {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const outputFormat =
            file.type === "image/png" ? "image/png" : "image/jpeg";

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.warn("Compression failed, returning original file");
                resolve(file);
                return;
              }

              resolve(
                new File([blob], file.name, {
                  type: outputFormat,
                  lastModified: Date.now(),
                })
              );
            },
            outputFormat,
            outputFormat === "image/jpeg" ? quality : 1
          );
        };

        img.onerror = () => {
          console.warn("Image load error, returning original file");
          resolve(file);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!file.type.match("image.*") && !file.name.endsWith(".avif")) continue;

      try {
        let processedFile = file;
        const isAVIF =
          file.type === "image/avif" || file.name.endsWith(".avif");

        // if (!isAVIF && file.size > 500000) {
        //   processedFile = await compressImage(file);
        // }

        const tempId = Date.now().toString() + Math.random();

        setNewDataImages((prev) => [
          ...prev,
          {
            id: tempId,
            url: URL.createObjectURL(processedFile),
            alt: "Chargement...",
            loading: true,
          },
        ]);

        const uploaded = await saveImages(processedFile);

        if (!uploaded || !uploaded.url) {
          setNewDataImages((prev) => prev.filter((img) => img.id !== tempId));
          throw new Error(`Upload échoué pour ${file.name}`);
        }

        setNewDataImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? {
                  id: uploaded.id,
                  url: uploaded.url,
                  alt: uploaded.alt,
                  loading: false,
                }
              : img
          )
        );
      } catch (error) {
        console.error("Erreur de traitement :", error);
        Notiflix.Notify.failure(`Erreur avec ${file.name}`);
      }
    }
  };

  const saveImages = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${url}/upload_images`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l’upload");
      }

      const data = await response.json();
      setImages((prev) => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Erreur upload image:", error);
      return null;
    }
  };

  const toggleImageSelect = (imageId) => {
    setSelectedIds((prevSelected) => {
      if (selecteOne) {
        return [imageId];
      }

      if (prevSelected.includes(imageId)) {
        return prevSelected.filter((id) => id !== imageId);
      }

      return [...prevSelected, imageId];
    });
  };

  const handleValidate = (e) => {
    e.preventDefault();
    if (choose === "upload") {
      const selected = newDataImages
        .filter((img) => selectedIds.includes(img.id))
        .map((img) => ({
          ...img,
          alt: altTexts[img.id] || "",
        }));
      if (selecteOne && selected.length > 0) {
        setThumbnail(selected[0]);
      } else {
        setGallery((prev) => [...prev, ...selected]);
      }
    } else {
      const selected = currentImages
        .filter((img) => selectedIds.includes(img.id))
        .map((img) => ({
          ...img,
          alt: altTexts[img.id] || "",
        }));

      if (selecteOne && selected.length > 0) {
        setThumbnail(selected[0]);
      } else {
        setGallery((prev) => [...prev, ...selected]);
      }
    }
    setShowMap(false);
    setSelectedIds([]);
  };

  return (
    <div className="w-full h-screen fixed top-0 left-0 bg-black/80 backdrop-blur-lg z-[999990]">
      <div
        ref={popupRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] min-h-[50%] max-w-[90%] rounded-md max-h-screen bg-white p-4 z-[65] cursor-pointer shadow-md overflow-auto"
      >
        <div className="w-full relative text-right">
          <FontAwesomeIcon
            onClick={() => setShowMap(false)}
            icon={faXmark}
            className="text-red-600 h-7 cursor-pointer"
          />
        </div>
        {loading ? (
          <div className="w-full min-h-[30vh] flex items-center justify-center">
            <ClipLoader
              color="#3b82f6"
              loading={true}
              size={50}
              speedMultiplier={1.5}
            />
          </div>
        ) : (
          <>
            <div className="flex space-x-4 justify-end list-none mb-6 ">
              {selectedIds.length > 0 ? (
                <button
                  className="bg-purple-900 text-white px-6 py-2 rounded-md mb-2"
                  onClick={(e) => handleValidate(e)}
                >
                  Valider {selectedIds.length} image(s)
                </button>
              ) : (
                <>
                  <li
                    className={`px-6 py-2 rounded-sm ${
                      choose === "upload" ? "bg-gray-300" : "bg-gray-100"
                    }`}
                    onClick={() => setChoose("upload")}
                  >
                    Uploader
                  </li>
                  <li
                    className={`px-6 py-2 rounded-sm ${
                      choose === "upload" ? "bg-gray-100" : "bg-gray-300"
                    }`}
                    onClick={() => setChoose("parcourir")}
                  >
                    Parcourir les galeries
                  </li>
                </>
              )}
            </div>

            <div className="w-full p-4">
              {choose === "upload" ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple={!selecteOne}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    className="mx-auto mt-6 text-center w-64 bg-blue-500 text-white py-2 rounded-md cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FontAwesomeIcon icon={faUpload} /> Ajouter une image
                  </div>

                  <div className="w-full flex flex-wrap gap-4 mt-6 max-h-[60vh] overflow-auto">
                    {newDataImages.map((image) => (
                      <div
                        key={image.id}
                        className={`relative border p-2 rounded-md w-48 cursor-pointer transition-all duration-150 ${
                          selectedIds.includes(image.id)
                            ? "border-blue-500 shadow-md"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          if (!image.loading) {
                            toggleImageSelect(image.id);
                          }
                        }}
                      >
                        <div className="w-full h-48 relative overflow-hidden">
                          {image.loading && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
                              <ClipLoader
                                color="#3b82f6"
                                loading={true}
                                size={2}
                                speedMultiplier={1.5}
                              />
                            </div>
                          )}
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-auto object-cover rounded-md"
                          />
                        </div>
                        <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                          {selectedIds.includes(image.id) && (
                            <span className="text-green-600 font-bold text-sm">
                              ✔
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {image.alt || ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-full max-h-[60vh] overflow-auto relative">
                    <div className="mb-4 px-4 w-full mx-auto sticky -top-2 shadow-md pb-1 bg-white z-50">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une image..."
                        className="w-full border px-3 py-2 rounded shadow-sm"
                      />
                    </div>
                    <div className="w-full flex flex-wrap gap-4 mt-6">
                      {currentImages.map((image) => (
                        <div
                          key={image.id}
                          className={`relative border p-2 rounded-md w-full md:w-48 cursor-pointer transition-all duration-150 ${
                            selectedIds.includes(image.id)
                              ? "border-blue-500 shadow-md"
                              : "border-gray-300"
                          }`}
                          onClick={() => toggleImageSelect(image.id)}
                        >
                          <div className="w-full h-48 relative overflow-hidden">
                            <img
                              src={image.url}
                              alt=""
                              className="w-full h-auto object-cover rounded-md"
                            />
                          </div>
                          <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow">
                            {selectedIds.includes(image.id) && (
                              <span className="text-green-600 font-bold text-sm">
                                ✔
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {image.alt || ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
