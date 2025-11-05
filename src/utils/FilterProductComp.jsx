import React, { useState, useEffect, useMemo } from "react";
import { url } from "../contextes/UrlContext";
import { showConfirmModal } from "./ConfirmDeleteProduct";
import Notiflix from "notiflix";
import GroupEditModalComp from "./GroupEditModalComp";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLeaf, faBan } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import axios from "axios";
import nProgress from "nprogress";

function toSlug(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FilterProduct({
  onAddProduct,
  productType = "réservation",
  products = [],
  onProductsFiltered,
  deleteProduit,
  selectedIds,
  setSelectedIds,
  onPaginationChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const capitalized = productType.charAt(0).toUpperCase() + productType.slice(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [postStatus, setPostStatus] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [groupAction, setGroupAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showGroupEditModal, setShowGroupEditModal] = useState(false);
  const [isAntiGaspillage, setIsAntiGaspillage] = useState("");

  const isProduct = productType.toLowerCase() === "produit";
  const titreSection = isProduct ? "Tous les produits" : `Tous les produits de ${productType}`;
  const boutonAjout = isProduct ? "Ajouter un produit" : `Ajouter un produit ${capitalized}`;
  const selectedProducts = products
    .filter((p) => Array.isArray(selectedIds) && selectedIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      title: p.title || p.post_title || p.name || `Produit ${p.id}`,
    }));
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`${url}/categories-produits`);
        if (!response.ok) throw new Error("Erreur API catégories");
        const data = await response.json();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const flatCategories = useMemo(() => {
    let result = [];
    for (let cat of categories) {
      if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
        for (let child of cat.children) {
          result.push({
            id: child.id,
            name: child.name,
            slug: child.slug || child.category_nicename || toSlug(child.name),
          });
        }
      } else {
        result.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug || cat.category_nicename || toSlug(cat.name),
        });
      }
    }
    return result;
  }, [categories]);

  async function filterByDateAndCategory(overrides = {}) {
    nProgress.start();
    try {
      const selectedMY = overrides.selectedMonthYear ?? selectedMonthYear;
      let derivedYear = overrides.year ?? "";
      let derivedMonth = overrides.month ?? "";
      if (!derivedYear && !derivedMonth && selectedMY) {
        const [y, m] = selectedMY.split("-");
        if (y && m) {
          derivedYear = y;
          derivedMonth = String(m).padStart(2, "0");
        }
      }

      // Gestion spéciale: statut "Anti-gaspillage"
      const effectiveStatus = (overrides.status ?? postStatus) || "";
      const effectiveAnti = (overrides.is_anti_gaspillage ?? isAntiGaspillage) || "";
      let statusForSearch = effectiveStatus;
      let antiForSearch = effectiveAnti;
      if (effectiveStatus === "__antigaspi") {
        statusForSearch = "";
        antiForSearch = "true";
      }

      const rawSearchParams = {
        status: statusForSearch,
        year: derivedYear,
        month: derivedMonth,
        is_anti_gaspillage: antiForSearch,
        category: (overrides.category ?? selectedCategorySlug) || "",
        search: ((overrides.search ?? searchTerm) || "").trim() || "",
      };

      const searchParams = Object.fromEntries(
        Object.entries(rawSearchParams).filter(([_, v]) => v !== "" && v != null)
      );

      const forceFirstPage = overrides.forceFirstPage ?? false;
      const match = location.pathname.match(/^(.*?)(?:\/page\/(\d+))\/?$/);
      const basePath = match ? match[1] || "/" : location.pathname;
      const currentPageFromPath = match ? parseInt(match[2], 10) : 1;
      const pageNumber = forceFirstPage ? 1 : currentPageFromPath;

      const newSearch = new URLSearchParams(searchParams).toString();
      const desiredPathname = forceFirstPage ? basePath : location.pathname;
      const needPathChange = desiredPathname !== location.pathname;
      const needSearchChange = newSearch !== (location.search || "").replace(/^\?/, "");
      if (needPathChange || needSearchChange) {
        navigate({ pathname: desiredPathname, search: newSearch ? `?${newSearch}` : "" }, { replace: true });
      }
        searchParams.is_anti_gaspillage === "true"
          ? 1
          : searchParams.is_anti_gaspillage === ""
          ? 0
          : undefined;
      const apiParams = {       
        status: searchParams.status,
        post_status: searchParams.status,
        annee: searchParams.year,
        mois: searchParams.month,
        is_anti_gaspillage: searchParams.is_anti_gaspillage,
        categorie: searchParams.category,
        search: searchParams.search,
        page: pageNumber
      };
      
      const typeSlug = toSlug(productType || "");
      let endpoint = `${url}/products/getAllProductNormale`;
      if (typeSlug.includes("circuit")) {
        endpoint = `${url}/products/getAllCircuit`;
      } else if (typeSlug.includes("reservation")) {
        endpoint = `${url}/products/getAllProductBooking`;
      } else if (typeSlug.includes("bille")) {
        endpoint = `${url}/products/getAllProductBilleterie`;
      }
      const response = await axios.get(endpoint, {
        params: apiParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const apiData = response.data;
      const list = Array.isArray(apiData)
        ? apiData
        : Array.isArray(apiData?.products)
        ? apiData.products
        : Array.isArray(apiData?.products?.data)
        ? apiData.products.data
        : Array.isArray(apiData?.data)
        ? apiData.data
        : [];
      const currentPageFromResponse =
        apiData?.current_page ??
        apiData?.products?.current_page ??
        apiData?.data?.current_page ??
        pageNumber;
      const lastPageFromResponse =
        apiData?.last_page ??
        apiData?.products?.last_page ??
        apiData?.data?.last_page ??
        (Array.isArray(list) && list.length > 0 ? pageNumber : 1);
      setFilteredProducts(list);
      onProductsFiltered && onProductsFiltered(list);
      if (onPaginationChange) {
        const normalizedCurrent = Number(currentPageFromResponse || 1);
        const normalizedLast = Number(lastPageFromResponse || 1);
        onPaginationChange({ currentPage: normalizedCurrent, lastPage: normalizedLast });
      }
    } catch (error) {
      console.error("Erreur lors du filtrage :", error);
      Notiflix.Notify.failure("Erreur lors de la récupération des produits !");
    }finally{
      nProgress.done();
    }
  }

  useEffect(() => {
    const sp = new URLSearchParams((location.search || "").replace(/^\?/, ""));
    const status = sp.get("status") || sp.get("post_status") || "";
    const year = sp.get("year") || "";
    const month = sp.get("month") || "";
    const category = sp.get("category") || sp.get("categorie") || "";
    const q = sp.get("search") || sp.get("q") || "";
    const anti = sp.get("is_anti_gaspillage") || "";

    if (anti === "true") {
      setPostStatus("__antigaspi");
    } else if (status !== undefined) {
      setPostStatus(status);
    }
    if (category !== undefined) setSelectedCategorySlug(category);
    if (q !== undefined) setSearchTerm(q);
    if (anti !== undefined) setIsAntiGaspillage(anti);
    if (year && month) setSelectedMonthYear(`${year}-${String(month).padStart(2, "0")}`);

    if (status || year || month || category || q || anti) {
      filterByDateAndCategory({
        status: anti === "true" ? "__antigaspi" : status, year, month, category, search: q, is_anti_gaspillage: anti,
        selectedMonthYear: `${year}-${String(month || "").padStart(2, "0")}`
      });
    }
  }, [location.search, location.pathname, productType]);

  async function handleApplyGroupAction() {
    if (groupAction === "delete" && selectedIds.length > 0) {
      const confirmed = await showConfirmModal(
        "Voulez-vous vraiment supprimer les produits sélectionnés ?",
        "Confirmation"
      );
      if (confirmed) {
        try {
          nProgress.start();
          await axios.delete(`${url}/products/bulk-delete`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { product_ids: selectedIds }
          });
          const sourceList = filteredProducts && filteredProducts.length > 0 ? filteredProducts : products;
          const updatedList = sourceList.filter(p => !selectedIds.includes(p.id));
          setFilteredProducts(updatedList);
          onProductsFiltered && onProductsFiltered(updatedList);
        setSelectedIds([]);
          Notiflix.Notify.success("Produits supprimés avec succès !");
        } catch (error) {
          console.error("Erreur suppression groupée:", error);
          Notiflix.Notify.failure("Erreur lors de la suppression groupée !");
        }
      }
    } else if (isProduct && groupAction === "antigaspi_set" && selectedIds.length > 0) {
      const confirmed = await showConfirmModal(
        "Activer le mode anti-gaspillage pour les produits sélectionnés ?",
        "Confirmation"
      );
      if (confirmed) {
        try {
          nProgress.start();
          await axios.post(`${url}/products/antigaspi-bulk-set`, { product_ids: selectedIds }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await filterByDateAndCategory({});
          setSelectedIds([]);
          setGroupAction("");
          Notiflix.Notify.success("Anti-gaspillage activé pour les produits sélectionnés !");
        } catch (error) {
          console.error("Erreur anti-gaspillage set:", error);
          Notiflix.Notify.failure("Erreur lors de l'activation anti-gaspillage !");
        }
      }
    } else if (isProduct && groupAction === "antigaspi_unset" && selectedIds.length > 0) {
      const confirmed = await showConfirmModal(
        "Désactiver le mode anti-gaspillage pour les produits sélectionnés ?",
        "Confirmation"
      );
      if (confirmed) {
        try {
          nProgress.start();
          await axios.post(`${url}/products/antigaspi-bulk-unset`, { product_ids: selectedIds }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await filterByDateAndCategory({});
          setSelectedIds([]);
          setGroupAction("");
          Notiflix.Notify.success("Anti-gaspillage désactivé pour les produits sélectionnés !");
        } catch (error) {
          console.error("Erreur anti-gaspillage unset:", error);
          Notiflix.Notify.failure("Erreur lors de la désactivation anti-gaspillage !");
        }
      }
    } else if (groupAction === "edit" && selectedIds.length > 0) {
      setShowGroupEditModal(true);
    }
    nProgress.done();
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border rounded-xl p-5 mb-5 bg-white shadow-lg"
    >
      <GroupEditModalComp
        open={showGroupEditModal}
        onClose={() => setShowGroupEditModal(false)}
        selectedProducts={selectedProducts}
        onRemoveProduct={(id) =>
          setSelectedIds((prev) => prev.filter((selId) => selId !== id))
        }
      />

      <div className="md:flex block text-sm justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 sm:mb-0 text-center sm:text-left">
          {titreSection}
        </h2>
        <div className="flex gap-2">
          {productType.toLowerCase().includes("bille") && (
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 text-sm rounded-lg shadow-sm transition-transform hover:scale-105"
              onClick={() => navigate("/billeterie/scan")}
            >
              <FontAwesomeIcon icon={faSearch} className="mr-1" /> Scanner des billets
            </button>
          )}
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg shadow-sm transition-transform hover:scale-105"
            onClick={onAddProduct}
          >
            {boutonAjout}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-4 items-center">
        <select value={postStatus} onChange={(e) => setPostStatus(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">Tous les statuts</option>
          <option value="publish">publié</option>
          <option value="draft">brouillon</option>
          {isProduct && (
            <option value="__antigaspi">Anti-gaspillage</option>
          )}
        </select>
        <input type="month" value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} className="border rounded-lg px-3 py-2"/>
        {/* Retrait du select Anti-gaspillage séparé */}
        <select value={selectedCategorySlug} onChange={(e) => setSelectedCategorySlug(e.target.value)} className="border rounded-lg px-3 py-2 min-w-[220px]">
          <option value="">– Choisir une catégorie –</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.slug || toSlug(cat.name)}>
                {cat.name}
              </option>
          ))}
        </select>
        <button onClick={() => filterByDateAndCategory({ forceFirstPage: true })} className="bg-gray-300 px-3 py-2 rounded-lg">Filtrer</button>
        <button
          onClick={() => {
            setPostStatus("");
            setSelectedMonthYear("");
            setIsAntiGaspillage("");
            setSelectedCategorySlug("");
            setSearchTerm("");
            setFilteredProducts(products);
            onProductsFiltered && onProductsFiltered(products);
            const basePath = (location.pathname || "").replace(/\/page\/[0-9]+\/?$/, "");
            navigate({ pathname: basePath, search: "" }, { replace: true });
          }}
          className="bg-gray-200 px-3 py-2 rounded-lg"
        >
          Réinitialiser
        </button>
      </motion.div>

      {/* Search & Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-4 items-center mt-5">
        <input type="text" placeholder="Recherche produits" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); filterByDateAndCategory({ search: (searchTerm || '').trim(), forceFirstPage: true }); } }} className="border rounded-lg px-3 py-2"/>
        <button onClick={() => filterByDateAndCategory({ search: (searchTerm || '').trim(), forceFirstPage: true })} className="bg-pink-500 text-white px-3 py-2 rounded-lg">Chercher</button>
        <select value={groupAction} onChange={(e) => setGroupAction(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">Actions groupées</option>
          <option value="delete">Supprimer définitivement</option>
          {isProduct && (
            <>
              <option value="antigaspi_set">♻️ Activer anti-gaspillage</option>
              <option value="antigaspi_unset">🚫 Désactiver anti-gaspillage</option>
            </>
          )}
        </select>
        <button onClick={handleApplyGroupAction} className="bg-pink-500 text-white px-3 py-2 rounded-lg">Appliquer</button>
      </motion.div>
    </motion.div>
  );
}
