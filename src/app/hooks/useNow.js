// import { useEffect, useState } from "react";

// let listeners = [];
// let intervalStarted = false;

// function startGlobalTimer() {
//   if (intervalStarted) return;

//   intervalStarted = true;
//   setInterval(() => {
//     const now = Date.now();
//     listeners.forEach((l) => l(now));
//   }, 1000);
// }

// export function useNow() {
//   const [now, setNow] = useState(Date.now());

//   useEffect(() => {
//     startGlobalTimer();

//     listeners.push(setNow);

//     return () => {
//       listeners = listeners.filter((l) => l !== setNow);
//     };
//   }, []);

//   return now;
// }




"use client";
import { useEffect, useState } from "react";

export function useNow() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  return now;
}
