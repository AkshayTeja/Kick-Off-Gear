"use client"
import { CartProvider } from './context/CartContext';
import './globals.css';

export default function App({ Component, pageProps }: any) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
