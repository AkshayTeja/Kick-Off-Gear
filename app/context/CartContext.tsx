"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartContextType {
  cartItems: any[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

// ✅ USE CartProviderProps here
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);

  const addToCart = (product: any) => {
    setCartItems((prev) => [
      ...prev,
      { ...product, cartItemId: Date.now() + Math.random() } // ✅ unique ID
    ]);
  };

  const removeFromCart = (cartItemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };
  

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
