export const slugify = (str) => {
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')          
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  export const formatError = (error) => {
    if (error.response) {
      return error.response.data.message || error.response.statusText;
    } else if (error.request) {
      return 'Pas de réponse du serveur';
    } else {
      return error.message;
    }
  };
