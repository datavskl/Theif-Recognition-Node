import { Link, useLocation } from "wouter";
import { Shield, ChevronDown, Moon, Sun, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/face-gallery", label: "Face Gallery" },
    { path: "/recognition-log", label: "Recognition Log" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <>
      {/* Header */}
      <header className="security-surface security-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="text-red-500 text-2xl" />
            <h1 className="text-xl font-semibold security-text-primary">
              AI Thief Face Recognition System
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="security-surface-secondary security-border rounded px-3 py-1 text-sm security-text-primary"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="security-surface-secondary hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 security-text-primary" />
              ) : (
                <Moon className="h-5 w-5 security-text-primary" />
              )}
            </Button>
            
            {/* Alert Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="security-accent-red hover:bg-red-700 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm security-text-primary">A</span>
              </div>
              <span className="text-sm security-text-primary">Admin</span>
              <Button
                variant="ghost"
                size="sm"
                className="security-text-primary"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="security-surface-secondary security-border px-6 py-3">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`pb-2 transition-colors ${
                  location === item.path
                    ? "text-white border-b-2 border-red-500 font-medium"
                    : "security-text-secondary hover:text-white"
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}