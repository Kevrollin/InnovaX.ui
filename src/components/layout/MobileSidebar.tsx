import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  Home, 
  FolderOpen, 
  Megaphone, 
  LayoutDashboard, 
  User, 
  Wallet, 
  LogOut, 
  Heart,
  TrendingUp,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWalletStore } from '@/store/walletStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface MobileSidebarProps {
  children?: React.ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wallet } = useWalletStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'student') return '/student/dashboard';
    return '/donor/dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleNavigation = () => {
    setIsOpen(false);
  };

  const navigationItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      label: 'Campaigns',
      href: '/campaigns',
      icon: Megaphone,
    },
  ];

  const dashboardItems = isAuthenticated ? [
    {
      label: 'Dashboard',
      href: getDashboardPath(),
      icon: LayoutDashboard,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      label: 'Wallet',
      href: '/donor/wallet',
      icon: Wallet,
    },
    {
      label: 'Favorites',
      href: '/donor/favorites',
      icon: Heart,
    },
    {
      label: 'Analytics',
      href: '/donor/analytics',
      icon: TrendingUp,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ] : [];

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[280px] sm:w-[320px] bg-background/95 backdrop-blur-xl border-r border-border/50 flex flex-col"
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-2 text-left">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-heading font-bold">
              Fund<span className="text-primary">Hub</span>
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/50 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {wallet && (
                <div className="mt-3 flex items-center space-x-2 rounded-md bg-success/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success font-medium">
                    {wallet.public_key.slice(0, 6)}...{wallet.public_key.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links - Scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-2 min-h-0 pb-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavigation}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {isAuthenticated && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  {dashboardItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavigation}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Bottom Actions - Fixed at bottom with proper spacing */}
          <div className="pt-4 border-t border-border/50 flex-shrink-0 pb-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    navigate('/signup');
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
