// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://ideaengine-25bb0-default-rtdb.firebaseio.com"
// });

import { NextResponse } from 'next/server';

// Handle a GET request to /api/users
export async function GET(request) {
    // Fetch data from a database or external API
    const users = [{ id: 1, name: 'John doe' }, { id: 2, name: 'Jane doe' }];

    // Return a JSON response
    return NextResponse.json(users, { status: 200 });
}