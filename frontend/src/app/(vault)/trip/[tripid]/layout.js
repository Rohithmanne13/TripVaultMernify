"use client"
import { useParams, usePathname } from "next/navigation";
import Link from 'next/link';
import { navItems } from './nav_items';
import { ArrowLeft, Luggage } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TripLayout({ children }) {
  const { tripid } = useParams();
  const pathname = usePathname();

  return (
    <div className='flex flex-col md:flex-row h-screen w-full bg-background'>
      {/* Sidebar */}
      <aside className='hidden md:flex flex-col border-r border-border bg-card w-64 h-screen'>
        {/* Logo & Back Button */}
        <div className="p-6 border-b border-border">
          <Link 
            href="/console" 
            className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Console</span>
          </Link>
          <Link href="/console" className="flex items-center gap-2">
            <Luggage className="w-7 h-7 text-primary" />
            <div className="flex items-baseline gap">
              <h1 className="text-xl font-bold text-foreground">Trip</h1>
              <h1 className="text-xl font-bold text-primary">Vault</h1>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const path = `/trip/${tripid}${item.href}`;
              const isActive = pathname === path;
              return (
                <li key={item.id}>
                  <Link
                    href={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      className={`${
                        isActive 
                          ? "text-primary-foreground" 
                          : "text-primary group-hover:scale-110 transition-transform"
                      }`} 
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border">
          <div className="px-4 py-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Trip ID</p>
            <p className="text-sm font-mono text-foreground truncate mt-1">{tripid}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link href="/console" className="flex items-center gap-2">
            <Luggage className="w-6 h-6 text-primary" />
            <div className="flex items-baseline gap-1">
              <h1 className="text-lg font-bold text-foreground">Trip</h1>
              <h1 className="text-lg font-bold text-primary">Vault</h1>
            </div>
          </Link>
          <Link href="/console">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex overflow-x-auto px-4 pb-2 gap-2 hide-scrollbar">
          {navItems.map((item) => {
            const path = `/trip/${tripid}/${item.href}`;
            const isActive = pathname === path;
            return (
              <Link
                key={item.id}
                href={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className='flex-1 overflow-auto bg-background'>
        {children}
      </main>
    </div>
  );
}
