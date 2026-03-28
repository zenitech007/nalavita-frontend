import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized Cron Request', { status: 401 });
  }

  try {
    const usersWithMeds = await prisma.user.findMany({
      where: {
        medications: { some: { isActive: true } },
        pushSubscription: { isNot: null }
      },
      include: {
        medications: { where: { isActive: true } },
        pushSubscription: true
      }
    });

    let sentCount = 0;

    for (const user of usersWithMeds) {
      const rawSub = user.pushSubscription?.subscription;
      if (!rawSub) continue;

      const pushSubscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;

      const medNames = user.medications.map(m => m.name).join(', ');
      const payload = JSON.stringify({
        title: "Amelia MedTech",
        body: `Time for your medications: ${medNames}. Tap to view your schedule.`,
        url: "/"
      });

      try {
        sentCount++;
      } catch (pushErr: any) {
        console.error(`Failed to send to user ${user.id}:`, pushErr);
        if (pushErr.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { userId: user.id } });
        }
      }
    }

    return NextResponse.json({ success: true, sentNotifications: sentCount });
  } catch (error) {
    console.error("Cron Execution Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}