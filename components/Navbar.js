'use client'
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebase/firebase"

const Navbar = () => {
    const router = useRouter();
    const navLinks = [
        { name: 'Home', path: '/#home' },
        { name: 'Pricing', path: '/#pricing' },
        { name: 'Contact', path: '/#contact' },
        { name: 'About', path: '/#about' },
    ];

    const ref = useRef(null);

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth", {
                    method: "GET",
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    console.log("User data:", data);
                    console.log("Current user:", auth.currentUser);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Error checking auth status:", err);
            }
        };
        checkAuth();

    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth", {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to logout");
            }

            setUser(null);
            setIsMenuOpen(false);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const userLabel = user?.name || user?.email || "U";
    const userInitial = userLabel.charAt(0).toUpperCase();

    return (
        <div ref={ref}>
            {/* <p className="w-10 h-[500px]"></p> */}
            <nav className={`fixed top-0 left-0 bg-indigo-500 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4" : "py-4 md:py-6"}`}>
                {/* Logo */}
                <Link href="/" className={`flex items-center cursor-pointer text-3xl font-bold text-white ${isScrolled && "invert opacity-80"}`}>
                    IdeaEngine
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8">
                    {navLinks.map((link, i) => (
                        <Link key={i} href={link.path} className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"}`}>
                            {link.name}
                            <div className={`${isScrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                        </Link>
                    ))}
                </div>

                {/* Desktop Right */}
                <div className="hidden md:flex items-center justify-center gap-4 relative">
                    {!user ? (
                        <Link href={'/signup'}>
                            <button className={`px-8 py-2.5 cursor-pointer rounded-full transition-all duration-500 ${isScrolled ? "text-white bg-black" : "bg-white text-black"}`}>
                                Signup / Login
                            </button>
                        </Link>
                    ) : (
                        <div className="relative group">
                            <button
                                className={`w-10 h-10 rounded-full font-semibold flex items-center justify-center cursor-pointer transition-all duration-500 ${isScrolled ? "bg-black text-white" : "bg-white text-black"}`}
                            >
                                {userInitial}
                            </button>

                            <div className="absolute right-0 top-full min-w-36 rounded-lg bg-white shadow-lg border border-gray-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-3 md:hidden">
                    <svg onClick={() => setIsMenuOpen(!isMenuOpen)} className={`h-6 w-6 cursor-pointer ${isScrolled ? "invert" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {navLinks.map((link, i) => (
                        <Link key={i} href={link.path} onClick={() => setIsMenuOpen(false)}>
                            {link.name}
                        </Link>
                    ))}

                    {!user ? (
                        <Link href={'/signup'}>
                            <button className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500">
                                Signup / Login
                            </button>
                        </Link>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="bg-red-600 text-white px-8 py-2.5 rounded-full transition-all duration-500">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}

export default Navbar
