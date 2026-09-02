/* Fallback de imaxes en dous pasos. Vai no <head> para estar definido antes
   de que o navegador intente cargar ningunha imaxe.
   1) foto real  ->  2) speaker-placeholder.svg  ->  3) avatar CSS */
function dossierPhotoFallback(img) {
  if (!img.getAttribute('data-fallback-tried')) {
    img.setAttribute('data-fallback-tried', '1');
    img.src = window.__dossierImgPath + 'speaker-placeholder.svg';
    return;
  }
  img.style.display = 'none';
  if (img.parentElement) { img.parentElement.classList.add('person--nophoto'); }
}

/* Logos de empresas: se falla o placeholder, a caixa debúxase por CSS. */
function dossierLogoFallback(img) {
  img.onerror = null;
  img.style.display = 'none';
  if (img.parentElement) { img.parentElement.classList.add('logo-slot--empty'); }
}
