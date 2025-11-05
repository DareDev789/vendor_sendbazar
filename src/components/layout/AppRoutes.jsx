import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import IndexTableauDeBoard from "../../components/TableauDeBoard/IndexTableauDeBoard.jsx";
import IndexRapports from "../../components/Rapports/IndexRapports.jsx";
import IndexCommandes from "../../components/Commandes/IndexCommandes.jsx";
import ShowCommande from "../../components/Commandes/ShowCommande.jsx";
import IndexAnnonces from "../../components/Annonces/IndexAnnonces.jsx";
import AnnonceDetail from "../../components/Annonces/AnnonceDetail.jsx";
import ListBilleterie from "../../components/ListBilleterie/ListBilleterie.jsx";
import ScanComp from "../../components/ListBilleterie/ScanComp.jsx";
import AddBilleterie from "../../components/AddBilleterie/AddBilleterie.jsx";
import StatistiquesComp from "../../components/ListBilleterie/StatistiquesComp.jsx";
import IndexProduct from "../../components/Products/IndexProduct.jsx";
import AddProduct from "../../components/Products/AddProduct/AddProduct.jsx";
import ListCircuit from "../../components/ListCircuit/ListCircuit.jsx";
import AddCircuit from "../../components/AddCircuit/AddCircuit.jsx";
import ListReservation from "../../components/ListReservation/ListReservation.jsx";
import AddReservation from "../../components/AddReservation/AddReservation.jsx";
import ReservationDetail from "../../components/ListReservation/ReservationDetail.jsx";
import IndexBoutique from "../../components/Reglages/Boutique/IndexBoutique.jsx";
import IndexPaiement from "../../components/Reglages/Paiement/IndexPaiement.jsx";
import Paypal from "../../components/Reglages/Paiement/Paypal.jsx";
import VirementBancaire from "../../components/Reglages/Paiement/VirementBancaire.jsx";
import MobileBanking from "../../components/Reglages/Paiement/MobileBanking.jsx";
import IndexReseauxSociaux from "../../components/Reglages/ReseauxSociaux/IndexReseauxSociaux.jsx";
import IndexMonCompte from "../../components/Reglages/MonCompte/IndexMonCompte.jsx";
import GroupEditModalComp from "../../utils/GroupEditModalComp";
import EditeResourceComp from "../../utils/EditeResourceComp";
import Confidentialite from "../../components/Login/politique-de-confidentialite.jsx";
import Conditions from "../../components/Login/conditions-generale-de-vente.jsx";
import NotFound from "../../components/NotFound.jsx";
import ProfileForm from "../../utils/ProfileForm";

function AppRoutes({ devise, listDevise }) {
  return (
    <Routes>
      <Route path="/" element={<IndexTableauDeBoard devise={devise} listDevise={listDevise} />} />
      <Route path="tableau-de-bord" element={<IndexTableauDeBoard devise={devise} listDevise={listDevise} />} />
      <Route path="rapports" element={<IndexRapports />} />
      <Route path="commandes" element={<IndexCommandes devise={devise} listDevise={listDevise} />} />
      <Route path="commandes/page/:page" element={<IndexCommandes devise={devise} listDevise={listDevise} />} />
      <Route path="commandes/:id" element={<ShowCommande devise={devise} listDevise={listDevise} />} />
      <Route path="commandes/:name" element={<IndexCommandes devise={devise} listDevise={listDevise} />} />
      <Route path="annonces" element={<IndexAnnonces />} />
      <Route path="annonces/page/:page" element={<IndexAnnonces />} />
      <Route path="annonce-detail/:id" element={<AnnonceDetail />} />
      <Route path="billeterie" element={<ListBilleterie />} />
      <Route path="billeterie/page/:page" element={<ListBilleterie />} />
      <Route path="billeterie/scan" element={<ScanComp />} />
      <Route path="billeterie/add" element={<AddBilleterie />} />
      <Route path="billeterie/stat" element={<StatistiquesComp />} />
      <Route path="billeterie/edit/:id" element={<AddBilleterie />} />
      <Route path="products" element={<IndexProduct />} />
      <Route path="products/page/:page" element={<IndexProduct />} />
      <Route path="products/ajouter-produit" element={<AddProduct />} />
      <Route path="products/edit/:id" element={<AddProduct />} />
      <Route path="circuit" element={<ListCircuit />} />
      <Route path="circuit/page/:page" element={<ListCircuit />} />
      <Route path="circuit/add" element={<AddCircuit />} />
      <Route path="circuit/edit/:id" element={<AddCircuit />} />
      <Route path="reservation" element={<ListReservation />} />
      <Route path="reservation/page/:page" element={<ListReservation devise={devise} listDevise={listDevise} />} />
      <Route path="reservation/add" element={<AddReservation />} />
      <Route path="reservation/edit/:id" element={<AddReservation />} />
      <Route path="reservation/detail/:id" element={<ReservationDetail devise={devise} listDevise={listDevise} />} />
      <Route path="reglages/boutique" element={<IndexBoutique />} />
      <Route path="reglages/paiement" element={<IndexPaiement />} />
      <Route path="reglages/paiement/parametre-paypal" element={<Paypal />} />
      <Route path="reglages/paiement/parametre-virement-bancaire" element={<VirementBancaire />} />
      <Route path="reglages/paiement/parametre-mobile-banking" element={<MobileBanking />} />
      <Route path="reglages/reseauxsociaux" element={<IndexReseauxSociaux />} />
      <Route path="reglages/moncompte" element={<IndexMonCompte />} />
      <Route path="group-edit" element={<GroupEditModalComp />} />
      <Route path="ressource/edit/:id" element={<EditeResourceComp />} />
      <Route path="politique-de-confidentialite" element={<Confidentialite />} />
      <Route path="conditions-generale-de-vente" element={<Conditions />} />
      <Route path="completer-profil" element={<ProfileForm />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/login" element={<Navigate to="/tableau-de-bord" replace />}/>
      <Route path="/create-my-store" element={<Navigate to="/tableau-de-bord" replace />}/>
    </Routes>
  );
}

export default AppRoutes;


