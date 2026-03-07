import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET() {
    const configured = Boolean(adminAuth);
    return NextResponse.json({ configured }, { status: 200 });
}
