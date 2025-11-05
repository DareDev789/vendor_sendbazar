import Notiflix from 'notiflix';

export function showConfirmModal(message = "Êtes-vous sûr ?", title = "Confirmation") {
  return new Promise((resolve) => {
    Notiflix.Confirm.show(
      title,
      message,
      "D'accord",
      'Annuler',
      () => resolve(true),
      () => resolve(false),
      {
        okButtonBackground: '#22c55e',
        cancelButtonBackground: '#ef4444',
        okButtonColor: '#fff',
        cancelButtonColor: '#fff',
        borderRadius: '8px',
      }
    );
  });
} 