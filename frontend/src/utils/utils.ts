// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour le parallax
export function calculateParallax(mouseX: number, mouseY: number, strength: number = 0.02) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  return {
    x: (mouseX - centerX) * strength,
    y: (mouseY - centerY) * strength
  };
}