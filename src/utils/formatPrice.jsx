import { Preferences } from '@capacitor/preferences';

export function formatDeviseSymbol(currency) {
  switch (currency) {
    case "€":
      return "EUR";
    case "Ar":
      return "MGA";
    case "CFA":
      return "XOF";
    default:
      return currency;
  }
}

export function formatDeviseToSymbol(currency) {
  switch (currency) {
    case "Eur":
      return "€";
    case "Mga":
      return "Ar";
    case "xof":
      return "CFA";
    default:
      return currency;
  }
}

export function calculatePricePaid(amount, currency) {
  const conversionRates = {
    "EUR": 1,
    "MGA": 4900,
    "CFA": 650,
  };
  switch (currency) {
    case "EUR":
      return amount;
    case "MGA":
      return amount * conversionRates["MGA"];
    case "XOF":
      return amount * conversionRates["XOF"];
    default:
      return amount;
  }
}

export function formatPrice(amount, currency = "€") {
  if (isNaN(amount)) return "";

  const intlCurrency = formatDeviseSymbol(currency);
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: intlCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  switch (currency) {
    case "€":
      return formatted.replace("EUR", "€");
    case "Ar":
      return formatted.replace("MGA", "Ar");
    case "CFA":
      return formatted.replace("XOF", "CFA");
    default:
      return formatted;
  }
}

export function calculatePricetoNewDevise(amount, fromCurrency, toCurrency) {
  const conversionRates = {
    "EUR": 1,
    "MGA": 4900,
    "XOF": 650,
  };

  if (typeof amount === "string") {
    amount = amount
      .replace(/[^\d.,-]/g, "")
      .replace(",", "."); 
  }

  amount = parseFloat(amount);

  if (isNaN(amount)) {
    console.error("Montant invalide :", amount);
    return NaN;
  }

  fromCurrency = fromCurrency?.toUpperCase();
  toCurrency = toCurrency?.toUpperCase();

  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (!conversionRates[fromCurrency] || !conversionRates[toCurrency]) {
    console.error(`Devise inconnue: ${fromCurrency} ou ${toCurrency}`);
    return NaN;
  }

  const amountInEUR = amount / conversionRates[fromCurrency];
  const converted = amountInEUR * conversionRates[toCurrency];

  return Math.round(converted * 100) / 100;
}

export const getToken = async() =>  {
  try {
    const { value } = await Preferences.get({ key: 'auth_token' });
    console.log("🔑 Token récupéré :", value);
    return value;
  } catch (err) {
    console.error("Erreur getToken:", err);
    return null;
  }
}

export const saveToken = async(token) => {
  try {
    await Preferences.set({ key: 'auth_token', value: token });
    console.log("✅ Token enregistré :", token);
  } catch (err) {
    console.error("Erreur saveToken:", err);
  }
}

export const removeToken = async () => {
  await Preferences.remove({ key: 'auth_token' });
};