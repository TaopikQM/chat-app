import React from 'react';
import { UserProvider } from './context/UserContext';
import './globals.css';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <UserProvider>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
