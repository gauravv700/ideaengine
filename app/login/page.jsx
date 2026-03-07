"use client"
import React, { useState } from 'react'
import { auth } from "@/lib/firebase/firebase"
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"

const Page = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    const handleLogin = async () => {
        if (!email || !password) {
            console.error("Email and password are required")
            return
        }
        try {
            const user = await signInWithEmailAndPassword(auth, email, password)
            const token = await user.user.getIdToken()
            const authResponse = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: token }),
                credentials: "include",
            });

            if (!authResponse.ok) {
                throw new Error("Failed to create session cookie")
            }

            router.push("/")
        } catch (error) {
            console.error("Error logging in:", error)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const idToken = await result.user.getIdToken()

            const authResponse = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                credentials: "include",
            })

            if (!authResponse.ok) {
                throw new Error("Failed to create session cookie")
            }

            router.push("/")
        } catch (error) {
            console.error("Error logging in with Google:", error)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form onSubmit={(e) => { e.preventDefault() }}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" autoComplete='email' id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" autoComplete='current-password' id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <button type="button" onClick={handleLogin} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-indigo-500 focus:ring-offset-2">Login</button>
                </form>
                <button onClick={handleGoogleLogin} className="flex items-center justify-center cursor-pointer w-full bg-white dark:bg-gray-900 border border-gray-300 rounded-md shadow-md mt-4 px-4 py-2 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    <svg
                        className="h-6 w-6 mr-2"
                        viewBox="-0.5 0 48 48"
                    >
                        <g fill="none" fillRule="evenodd">
                            <path
                                d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                                fill="#FBBC05"
                            />
                            <path
                                d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                                fill="#EB4335"
                            />
                            <path
                                d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                                fill="#34A853"
                            />
                            <path
                                d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                                fill="#4285F4"
                            />
                        </g>
                    </svg>
                    <span>Continue with Google</span>
                </button>
                <p className="mt-4 text-center text-sm text-gray-600">
                    New here?{" "}
                    <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Page
