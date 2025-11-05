import axios from 'axios';
import { utils, writeFile, write } from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import countriesData from '../data/countries.json';

// Transforme des données JSON en classeur XLSX et déclenche le téléchargement
export function exportJsonToXlsx({ data, fileName = 'export.xlsx', sheetName = 'Feuille1' }) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, sheetName);

  try {
    // Méthode 1: writeFile (déclenche téléchargement directement dans la plupart des environnements)
    writeFile(workbook, fileName);
  } catch (e) {
    // Méthode 2: fallback via Blob + file-saver
    const wbout = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }
}

// Optionnel: helper pour mapper/renommer des colonnes
export function mapColumns(data, columnsMap) {
  if (!columnsMap) return data;
  return (data || []).map((row) => {
    const mapped = {};
    Object.entries(columnsMap).forEach(([from, to]) => {
      mapped[to] = row[from];
    });
    return mapped;
  });
}

// Optionnel: helper pour ne garder que certaines colonnes (dans l'ordre)
export function pickColumns(data, columns) {
  if (!Array.isArray(columns) || columns.length === 0) return data;
  return (data || []).map((row) => {
    const picked = {};
    columns.forEach((key) => {
      picked[key] = row[key];
    });
    return picked;
  });
}

// Récupère toutes les commandes depuis le backend (toutes pages) via /mes-commandes
export async function fetchAllCommandes({ apiBaseUrl, token }) {
  let page = 1;
  let last = 1;
  let all = [];
  try {
    do {
      const response = await axios.get(`${apiBaseUrl}/mes-commandes`, {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = response.data || {};
      const list = Array.isArray(apiData?.allcommandes)
        ? apiData.allcommandes
        : Array.isArray(apiData?.data)
        ? apiData.data
        : Array.isArray(apiData)
        ? apiData
        : Array.isArray(apiData?.allcommandes?.data)
        ? apiData.allcommandes.data
        : [];
      const current = (
        apiData?.current_page ??
        apiData?.allcommandes?.current_page ??
        apiData?.data?.current_page ??
        page
      );
      last = (
        apiData?.last_page ??
        apiData?.allcommandes?.last_page ??
        apiData?.data?.last_page ??
        1
      );
      if (Array.isArray(list) && list.length > 0) {
        all = all.concat(list);
      }
      page = (Number(current) || page) + 1;
    } while (page <= Number(last));
    return all;
  } catch (error) {
    console.error('[ExportFichierXl] Erreur fetchAllCommandes:', error);
    throw error;
  }
}

// Exporte des commandes en XLSX avec options de mapping/pick
export function exportCommandesXlsx({ commandes, fileName = 'commandes.xlsx', sheetName = 'Commandes', columnsMap, pick }) {
  if (!Array.isArray(commandes) || commandes.length === 0) {
    throw new Error('Aucune commande à exporter');
  }
  let rows = commandes;
  if (columnsMap) rows = mapColumns(rows, columnsMap);
  if (Array.isArray(pick) && pick.length > 0) rows = pickColumns(rows, pick);
  exportJsonToXlsx({ data: rows, fileName, sheetName });
}

// Traduction simple des statuts WooCommerce vers FR
export function traduireStatutFR(statut) {
  const statusMap = {
    'wc-pending': 'En attente',
    'wc-processing': 'En cours',
    'wc-on-hold': 'En attente',
    'wc-completed': 'Terminée',
    'wc-cancelled': 'Annulée',
    'wc-refunded': 'Remboursée',
    'wc-failed': 'Échoué',
    'wc-draft': 'Brouillon',
    'wc-trash': 'Supprimée',
    'pending': 'En attente',
    'processing': 'En cours',
    'on-hold': 'En attente',
    'completed': 'Terminée',
    'cancelled': 'Annulée',
    'refunded': 'Remboursée',
    'failed': 'Échoué',
    'draft': 'Brouillon',
    'trash': 'Supprimée',
  };
  return statusMap[statut] || statut || '';
}
// Construit une ligne prête à exporter avec les en-têtes FR fournis
export function mapCommandeToRowFR(cmd) {
  // Préférence: products[].name du backend, sinon fallback line_items/items
  const productNames = Array.isArray(cmd?.products)
    ? cmd.products.map((p) => (p?.name || '')).filter(Boolean).join(', ')
    : '';
  const fallbackItems = Array.isArray(cmd?.line_items || cmd?.items)
    ? (cmd.line_items || cmd.items).map((it) => (it?.name || it?.product_name || '')).filter(Boolean).join(', ')
    : '';
  const lineItems = productNames || fallbackItems;
  const shippingLines = Array.isArray(cmd?.shipping_lines) ? cmd.shipping_lines : [];
  const shippingMethodTitle = shippingLines[0]?.method_title || cmd?.shipping_method || '';
  const shippingTotal = cmd?.shipping_total ?? shippingLines[0]?.total ?? '';
  const paymentMethod = cmd?.payment_method_title || cmd?.payment_method || '';
  const total = cmd?.total ?? '';
  const revenus = cmd?.revenus ?? cmd?.vendor_earnings ?? '';
  const statut = traduireStatutFR(cmd?.statut || cmd?.status);
  const date = (cmd?.date_created || cmd?.date)?.toString()?.split(' ')[0] || '';

  const billing = cmd?.billing || {};
  const shipping = cmd?.shipping || {};
  // Supporte le schéma avec clés préfixées comme dans l'exemple backend
  const billingFirst = billing?._billing_first_name || billing?.first_name || '';
  const billingLast = billing?._billing_last_name || billing?.last_name || '';
  const billingCompany = billing?._billing_company || billing?.company || '';
  const billingEmail = billing?._billing_email || billing?.email || '';
  const billingPhone = billing?._billing_phone || billing?.phone || '';
  const billingAddress1 = billing?._billing_address_1 || billing?.address_1 || '';
  const billingAddress2 = billing?._billing_address_2 || billing?.address_2 || '';
  const billingCity = billing?._billing_city || billing?.city || '';
  const billingState = billing?._billing_state || billing?.state || '';
  const billingPostcode = billing?._billing_postcode || billing?.postcode || '';
  const countriesDict = countriesData?.countries || {};
  const formatCountry = (code) => {
    const upper = (code || '').toString().trim().toUpperCase();
    if (!upper) return '';
    const name = countriesDict[upper];
    return name || upper;
  };
  const billingCountry = formatCountry(billing?._billing_country || billing?.country || '');
  const shippingFirst = shipping?._shipping_first_name || shipping?.first_name || '';
  const shippingLast = shipping?._shipping_last_name || shipping?.last_name || '';
  const shippingAddress1 = shipping?._shipping_address_1 || shipping?.address_1 || '';
  const shippingAddress2 = shipping?._shipping_address_2 || shipping?.address_2 || '';
  const shippingCity = shipping?._shipping_city || shipping?.city || '';
  const shippingState = shipping?._shipping_state || shipping?.state || '';
  const shippingPostcode = shipping?._shipping_postcode || shipping?.postcode || '';
  const shippingCountry = formatCountry(shipping?._shipping_country || shipping?.country || '');

  return {
    'Commande N°': cmd?.id ?? cmd?.number ?? '',
    'Articles de Commande': lineItems,
    'Mode de livraison': shippingMethodTitle,
    'Frais de ports': shippingTotal,
    'Mode de paiement': paymentMethod,
    'Total de la commande': total,
    'Gains': revenus,
    'Statut de la commande': statut,
    'Date de commande': date,
    'Société (pour la facturation)': billingCompany,
    'Prénom de facturation': billingFirst,
    'Nom de famille de facturation': billingLast,
    'Nom complet de facturation': `${billingFirst} ${billingLast}`.trim(),
    'Email de facturation': billingEmail,
    'Téléphone de facturation': billingPhone,
    'Adresse de facturation': billingAddress1,
    "Adresse de facturation 2": billingAddress2,
    'Ville de facturation': billingCity,
    'État ou province de facturation': billingState,
    'Code postal de facturation': billingPostcode,
    'Pays de facturation': billingCountry,
    'Transporteur': shippingMethodTitle,
    'Prénom de livraison': shippingFirst,
    'Nom de famille de livraison': shippingLast,
    'Nom complet (pour la livraison)': `${shippingFirst} ${shippingLast}`.trim(),
    'Livraison - Adresse 1': shippingAddress1,
    'Livraison - Adresse 2': shippingAddress2,
    'Ville de livraison': shippingCity,
    'État ou province de livraison': shippingState,
    "Code postal d’expédition": shippingPostcode,
    'Pays de livraison': shippingCountry,
    'Adresse IP du client': cmd?.customer_ip_address || cmd?.ip_address || '',
    'Note client': cmd?.customer_note || cmd?.note || '',
  };
}

// Colonnes dans l'ordre attendu pour l'export
export const colonnesCommandesFR = [
  'Commande N°',
  'Articles de Commande',
  'Mode de livraison',
  'Frais de ports',
  'Mode de paiement',
  'Total de la commande',
  'Gains',
  'Statut de la commande',
  'Date de commande',
  'Société (pour la facturation)',
  'Prénom de facturation',
  'Nom de famille de facturation',
  'Nom complet de facturation',
  'Email de facturation',
  'Téléphone de facturation',
  'Adresse de facturation',
  'Adresse de facturation 2',
  'Ville de facturation',
  'État ou province de facturation',
  'Code postal de facturation',
  'Pays de facturation',
  'Transporteur',
  'Prénom de livraison',
  'Nom de famille de livraison',
  'Nom complet (pour la livraison)',
  'Livraison - Adresse 1',
  'Livraison - Adresse 2',
  'Ville de livraison',
  'État ou province de livraison',
  'Code postal d’expédition',
  'Pays de livraison',
  'Adresse IP du client',
  'Note client',
];

// Exporte avec le mapping FR et l'ordre des colonnes
export function exportCommandesXlsxFR({ commandes, fileName = 'commandes.xlsx' }) {
  const rows = (commandes || []).map(mapCommandeToRowFR);
  const picked = pickColumns(rows, colonnesCommandesFR);
  exportJsonToXlsx({ data: picked, fileName, sheetName: 'Commandes' });
}

// Convertit un index (1-based) en lettre de colonne Excel (A, B, ..., AA, AB, ...)
function columnIndexToLetter(index) {
  let dividend = index;
  let columnName = '';
  while (dividend > 0) {
    let modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return columnName;
}

// Export stylé avec ExcelJS (entêtes colorées, largeurs, freeze, autofilter)
export async function exportCommandesExcelJSFR({ commandes, fileName = 'commandes.xlsx' }) {
  const rows = (commandes || []).map(mapCommandeToRowFR);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('Aucune commande à exporter');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Commandes');
  // Définir une hauteur de ligne par défaut pour éviter une première ligne trop compacte
  worksheet.properties.defaultRowHeight = 22;

  // Définir les colonnes avec largeurs adaptées
  const columnWidths = {
    'Commande N°': 14,
    'Articles de Commande': 35,
    'Mode de livraison': 22,
    'Frais de ports': 14,
    'Mode de paiement': 20,
    'Total de la commande': 18,
    'Gains': 14,
    'Statut de la commande': 20,
    'Date de commande': 18,
    'Société (pour la facturation)': 26,
    'Prénom de facturation': 20,
    'Nom de famille de facturation': 24,
    'Nom complet de facturation': 26,
    'Email de facturation': 28,
    'Téléphone de facturation': 20,
    'Adresse de facturation': 28,
    'Adresse de facturation 2': 22,
    'Ville de facturation': 20,
    'État ou province de facturation': 26,
    'Code postal de facturation': 22,
    'Pays de facturation': 20,
    'Transporteur': 20,
    'Prénom de livraison': 20,
    'Nom de famille de livraison': 24,
    'Nom complet (pour la livraison)': 28,
    'Livraison - Adresse 1': 28,
    'Livraison - Adresse 2': 22,
    'Ville de livraison': 20,
    'État ou province de livraison': 26,
    'Code postal d’expédition': 24,
    'Pays de livraison': 20,
    'Adresse IP du client': 22,
    'Note client': 32,
  };

  worksheet.columns = colonnesCommandesFR.map((header) => ({
    header,
    key: header,
    width: columnWidths[header] || 18,
    style: { alignment: { vertical: 'middle', wrapText: true } },
  }));

  // Ajouter les données
  rows.forEach((row) => worksheet.addRow(row));

  // Style des entêtes
  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // bleu
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB3B3B3' } },
      left: { style: 'thin', color: { argb: 'FFB3B3B3' } },
      bottom: { style: 'thin', color: { argb: 'FFB3B3B3' } },
      right: { style: 'thin', color: { argb: 'FFB3B3B3' } },
    };
  });

  // Figer la première ligne
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // AutoFilter sur toute la ligne d'entête
  const lastColLetter = columnIndexToLetter(colonnesCommandesFR.length);
  worksheet.autoFilter = `A1:${lastColLetter}1`;

  // Uniformiser la hauteur des lignes de données (évite la première ligne trop petite)
  for (let r = 2; r <= worksheet.rowCount; r += 1) {
    const row = worksheet.getRow(r);
    if (!row.height || row.height < 22) {
      row.height = 22;
    }
    row.alignment = { vertical: 'middle' };
  }

  // Générer et télécharger
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
}


