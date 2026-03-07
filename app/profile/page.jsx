"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const initialForm = {
    displayName: "",
    company: "",
    phone: "",
    bio: "",
    plan: "Starter",
    photoURL: "",
};

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [blueprints, setBlueprints] = useState([]);
    const [stats, setStats] = useState({ blueprintCount: 0 });
    const [form, setForm] = useState(initialForm);

    const initials = useMemo(() => {
        const value = form.displayName || user?.displayName || user?.email || "U";
        return value.charAt(0).toUpperCase();
    }, [form.displayName, user]);

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/profile", {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                setUser(data.user);
                setStats(data.stats || { blueprintCount: 0 });
                setBlueprints(data.blueprints || []);
                setForm({
                    displayName: data.user?.displayName || "",
                    company: data.user?.company || "",
                    phone: data.user?.phone || "",
                    bio: data.user?.bio || "",
                    plan: data.user?.plan || "Starter",
                    photoURL: data.user?.photoURL || "",
                });
            } catch (error) {
                setMessage(`Error loading profile: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            setUser((prev) => ({ ...prev, ...form }));
            setMessage("Profile updated successfully.");
        } catch (error) {
            setMessage(`Update failed: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        setMessage("");
        try {
            const body = new FormData();
            body.append("file", file);

            const uploadResponse = await fetch("/api/profile/photo", {
                method: "POST",
                credentials: "include",
                body,
            });

            if (!uploadResponse.ok) {
                throw new Error(await uploadResponse.text());
            }

            const { photoURL } = await uploadResponse.json();
            setForm((prev) => ({ ...prev, photoURL }));
            setUser((prev) => ({ ...prev, photoURL }));
            setMessage("Profile photo updated.");
        } catch (error) {
            setMessage(`Photo upload failed: ${error.message}`);
        } finally {
            setUploadingPhoto(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 pt-28 px-6 md:px-16">
                <div className="max-w-6xl mx-auto text-gray-600">Loading profile...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-28 pb-16 px-6 md:px-16">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                <section className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
                    {form.photoURL || user?.photoURL ? (
                        <Image
                            src={form.photoURL || user?.photoURL}
                            alt="Profile"
                            width={64}
                            height={64}
                            unoptimized
                            className="w-16 h-16 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                            {initials}
                        </div>
                    )}
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">{form.displayName || "Unnamed User"}</h1>
                    <p className="text-gray-600 mt-1">{user?.email || "-"}</p>
                    <div className="mt-5 space-y-2 text-sm text-gray-700">
                        <p><span className="font-semibold">Membership:</span> {form.plan}</p>
                        <p><span className="font-semibold">Blueprints:</span> {stats.blueprintCount}</p>
                        <p><span className="font-semibold">Joined:</span> {formatDate(user?.joinedAt)}</p>
                        <p><span className="font-semibold">Email Verified:</span> {user?.emailVerified ? "Yes" : "No"}</p>
                    </div>
                    <Link href="/generateblueprint" className="inline-block mt-6 w-full text-center rounded-lg bg-indigo-600 text-white py-2.5 font-semibold hover:bg-indigo-700">
                        Generate New Blueprint
                    </Link>
                    <label className="inline-block mt-3 w-full text-center rounded-lg border border-gray-300 py-2.5 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50">
                        {uploadingPhoto ? "Uploading..." : "Upload Profile Photo"}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                </section>

                <section className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <form onSubmit={handleSave} className="mt-4 grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Display Name</label>
                            <input name="displayName" value={form.displayName} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" required />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Membership Plan</label>
                            <select name="plan" value={form.plan} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
                                <option value="Starter">Starter</option>
                                <option value="Pro">Pro</option>
                                <option value="Team">Team</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Company</label>
                            <input name="company" value={form.company} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Photo URL</label>
                            <input name="photoURL" value={form.photoURL || ""} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea name="bio" value={form.bio} onChange={handleInput} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 min-h-24" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" disabled={saving} className="rounded-lg bg-gray-900 text-white px-5 py-2.5 font-semibold hover:bg-black disabled:opacity-70">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                    {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
                </section>

                <section className="lg:col-span-3 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Generated Blueprints</h2>
                        <span className="text-sm text-gray-500">{stats.blueprintCount} total</span>
                    </div>

                    {blueprints.length === 0 ? (
                        <p className="mt-4 text-gray-600">No blueprints yet. Generate your first one.</p>
                    ) : (
                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                            {blueprints.map((bp) => (
                                <article key={bp.id} className="rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors">
                                    <h3 className="font-semibold text-gray-900">{bp.businessName}</h3>
                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{bp.idea}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">Timeline: {bp.timeline || "-"}</span>
                                        <span className="rounded-full bg-gray-100 text-gray-700 px-2.5 py-1">Model: {bp.revenueModel || "-"}</span>
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500">Created on {formatDate(bp.createdAt)}</p>
                                    <div className="mt-3 flex gap-2">
                                        <Link href={`/blueprints/${bp.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                                            View Details
                                        </Link>
                                        <Link href={`/api/blueprints/${bp.id}/pdf`} className="text-sm font-medium text-gray-700 hover:underline">
                                            Download PDF
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
