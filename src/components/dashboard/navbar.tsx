"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Input } from "../ui/input";
import { UserNav } from "./user-nav";
import { ModeToggle } from "../mode-toggle";

const navigation = [
  { name: "Inicio", href: "/dashboard" },
  { name: "Mi Pensión", href: "/dashboard/pension" },
  { name: "Documentos", href: "/dashboard/documentos" },
  { name: "Asesorías", href: "/dashboard/asesorias" },
];

/**
 * Componente de barra de navegación premium del dashboard
 */
export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [searchFocused, setSearchFocused] = useState(false);

  // Efecto de scroll para la navbar
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "US";

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm" 
          : "bg-background"
      )}
    >
      <div className="container h-16">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Sección izquierda */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick} 
              className="lg:hidden hover:bg-accent/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
              className="flex items-center lg:ml-4"
            >
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <Image
                  src="/images/logos/Logo version azul.png"
                  alt="Zentry Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <h1 className="text-xl font-bold hidden sm:block text-foreground group-hover:text-primary transition-colors">
                  Zentry
                </h1>
              </Link>
            </motion.div>
          </div>

          {/* Barra de búsqueda central */}
          <motion.div 
            className={cn(
              "hidden md:flex relative max-w-md flex-1 transition-all duration-300",
              searchFocused ? "scale-105" : "scale-100"
            )}
            layout
          >
            <div className="relative w-full">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
                searchFocused ? "text-primary" : "text-muted-foreground"
              )} />
              <Input 
                placeholder="Buscar trámites, documentos, asesorías..." 
                className={cn(
                  "w-full pl-10 pr-4 transition-all duration-300",
                  searchFocused ? "ring-2 ring-primary/20 border-primary" : "",
                  "bg-accent/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                )}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </motion.div>

          {/* Elementos de la derecha */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent/50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 text-[10px] font-medium text-white flex items-center justify-center">
                2
              </span>
            </Button>

            <ModeToggle />

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
            <UserNav />
          </div>
        </div>
      </div>
    </motion.header>
  );
} 