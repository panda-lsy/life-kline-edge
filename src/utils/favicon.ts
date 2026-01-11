export function updateFavicon(themeName: string) {
  const faviconUrl = themeName === 'cyberpunk' ? '/favicon-cyberpunk.svg' : '/favicon.svg';
  const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  if (link) {
    link.href = faviconUrl;
  }
}
