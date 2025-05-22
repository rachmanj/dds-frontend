"use client"

import Link from 'next/link'
import React from 'react'
import { LogOut, MoonIcon, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'


const Navbar = () => {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        toast.success("Logged out successfully");
        router.push("/login");
    };

    return (
        <nav className=" p-4 flex items-center justify-between">
            {/* LEFT */}
            Collapse button
            {/* RIGHT */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">Dashboard</Link>
                <MoonIcon />

                <DropdownMenu>
                    <DropdownMenuTrigger><Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
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