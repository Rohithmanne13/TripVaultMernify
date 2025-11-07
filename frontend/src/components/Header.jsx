"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Luggage } from "lucide-react";

const Header = () => {
    const { user } = useUser();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* App Name & Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                        <Luggage className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">TripVault</h1>
                        <p className="text-xs text-muted-foreground">Plan your adventures</p>
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "w-10 h-10",
                                userButtonPopoverCard: "shadow-lg",
                            }
                        }}
                        afterSignOutUrl="/"
                    />
                    {user && (
                        <div className="hidden md:flex flex-col">
                            <p className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
