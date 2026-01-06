import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Klompsidian | Uw Markdown Notities',
    description: 'Een premium Obsidian-achtige ervaring in Docker',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="nl">
            <body>{children}</body>
        </html>
    );
}
