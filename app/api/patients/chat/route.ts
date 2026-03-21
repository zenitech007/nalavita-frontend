import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabaseClient';

// Helper to securely verify the token
async function getAuthUser(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return null;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
}

// ==========================================
// GET: Fetch all chats for the Sidebar
// ==========================================
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const chats = await prisma.chat.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' }, // Newest chats at the top
            include: { messages: true }
        });

        return NextResponse.json(chats, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch chats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ==========================================
// POST: Create a new chat session
// ==========================================
export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { title, firstMessage, role = 'user' } = body;

        // Failsafe: Ensure the core User row exists in DB to satisfy foreign keys
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: { id: user.id, email: user.email || 'unknown@email.com', role: 'PATIENT' }
        });

        // Create the chat and link the first message
        const chat = await prisma.chat.create({
            data: {
                title: title || "New Health Chat",
                userId: user.id,
                messages: {
                    create: { role, content: firstMessage }
                }
            },
            include: { messages: true }
        });

        return NextResponse.json({ chat }, { status: 201 });
    } catch (error) {
        console.error("Failed to create chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ==========================================
// PUT: Add a new message to an existing chat
// ==========================================
export async function PUT(request: Request) {
    try {
        const user = await getAuthUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { chatId, role, content, imageUrl } = body;

        // Security check: Verify the chat actually belongs to this exact user
        const existingChat = await prisma.chat.findUnique({
            where: { id: chatId }
        });

        if (!existingChat || existingChat.userId !== user.id) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        // Add the message
        const message = await prisma.message.create({
            data: { chatId, role, content, imageUrl }
        });

        // Bump the chat's updatedAt timestamp so it jumps to the top of the sidebar
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message, { status: 200 });
    } catch (error) {
        console.error("Failed to save message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}