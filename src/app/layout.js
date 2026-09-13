// src/app/layout.js
'use client';

import { useEffect } from 'react';
import { UserProvider } from './context/UserContext';
import './globals.css';

export default function RootLayout({ children }) {
  useEffect(() => {
    // ✅ Register Service Worker untuk Firebase Messaging
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

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
// import React from 'react';
// import { UserProvider } from './context/UserContext';
// import './globals.css';

// export default function RootLayout({ children }) {
//     return (
//         <html lang="en">
            // <body>
            //     <UserProvider>
            //         {children}
            //     </UserProvider>
            // </body>
//         </html>
//     );
// }
