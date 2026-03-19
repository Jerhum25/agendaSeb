// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Agenda Pro',
  description: 'Gestion de rendez-vous et clients',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}