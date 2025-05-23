"use client"

import React from 'react'
import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { SidebarTrigger } from '../ui/sidebar'


const Navbar = () => {
    const router = useRouter();
    const { setTheme } = useTheme();
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        toast.success("Logged out successfully");
        router.push("/login");
    };

    // Get user's name or fallback to email or "User"
    const getUserDisplayName = () => {
        if (session?.user?.name) {
            return session.user.name;
        }
        if (session?.user?.email) {
            return session.user.email.split('@')[0]; // Use email username part
        }
        return "User";
    };

    // Get user's initials for avatar fallback
    const getUserInitials = () => {
        const name = getUserDisplayName();
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <nav className=" p-4 flex items-center justify-between">
            {/* LEFT */}
            <SidebarTrigger />
            {/* RIGHT */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                    Welcome, {getUserDisplayName()}
                </span>
                {/* THEME MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* USER MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger><Avatar>
                        <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar></DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><User className='h-[1.2rem] w-[1.2rem] mr-2' /> Profile</DropdownMenuItem>
                        <DropdownMenuItem><Settings className='h-[1.2rem] w-[1.2rem] mr-2' /> Settings</DropdownMenuItem>
                        <DropdownMenuItem variant='destructive' onClick={handleSignOut}><LogOut className='h-[1.2rem] w-[1.2rem] mr-2' /> Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}

export default Navbar