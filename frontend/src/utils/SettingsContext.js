function getCookie(name) {
    if (typeof document === 'undefined') {
      throw new Error(
        'getCookie() is not supported on the server. Fallback to a different value when rendering on the server.'
      );
    }
  
    const value = `; ${document.cookie}`;
  
    const parts = value.split(`; ${name}=`);
  
    if (parts.length === 2) {
      return parts[1].split(';').shift();
    }
  
    return undefined;
  }
  
  function setCookie(name, value, exdays = 3) {
    const date = new Date();
    date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }
  
  function removeCookie(name) {
    document.cookie = `${name}=;path=/;max-age=0`;
  }