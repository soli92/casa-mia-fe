export default function manifest() {
  return {
    name: 'Casa Mia',
    short_name: 'CasaMia',
    description: 'Gestione casa intelligente per famiglie',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0F0F10',
    theme_color: '#C7A64A',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192-dark.png',
        sizes: '192x192',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        src: '/icons/icon-512-dark.png',
        sizes: '512x512',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  }
}
