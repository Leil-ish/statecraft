import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nation } = body as { nation: any };
    
    // Update or create the nation for this user in the specified slot
    const updatedNation = await prisma.nation.upsert({
      where: {
        id: nation.id || `slot-${nation.slot}-${session.user.id}`,
      },
      update: {
        slot: nation.slot,
        name: nation.name,
        motto: nation.motto,
        flag: nation.flag,
        governmentType: nation.governmentType,
        currency: nation.currency,
        capital: nation.capital,
        leader: nation.leader,
        era: nation.era,
        gameMode: nation.gameMode,
        stats: JSON.stringify(nation.stats),
        currentIssue: JSON.stringify(nation.currentIssue || null),
        decisionHistory: JSON.stringify(nation.history || []),
        historyLog: JSON.stringify(nation.historyLog || []),
        issuesResolved: nation.issuesResolved || 0,
        founded: nation.founded ? new Date(nation.founded) : undefined,
      },
      create: {
        userId: session.user.id,
        slot: nation.slot || 1,
        name: nation.name,
        motto: nation.motto,
        flag: nation.flag,
        governmentType: nation.governmentType,
        currency: nation.currency,
        capital: nation.capital,
        leader: nation.leader,
        era: nation.era,
        gameMode: nation.gameMode,
        stats: JSON.stringify(nation.stats),
        currentIssue: JSON.stringify(nation.currentIssue || null),
        decisionHistory: JSON.stringify(nation.history || []),
        historyLog: JSON.stringify(nation.historyLog || []),
        issuesResolved: nation.issuesResolved || 0,
        founded: nation.founded ? new Date(nation.founded) : undefined,
      },
    });

    return NextResponse.json(updatedNation);
  } catch (error) {
    console.error("Failed to save nation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slot = searchParams.get("slot");

    if (slot) {
      await prisma.nation.deleteMany({
        where: { 
          userId: session.user.id,
          slot: parseInt(slot)
        },
      });
    } else {
      await prisma.nation.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete nation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nations = await prisma.nation.findMany({
      where: { userId: session.user.id },
      orderBy: { slot: "asc" },
    });

    if (!nations || nations.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(nations.map((nation: any) => ({
      ...nation,
      stats: JSON.parse(nation.stats),
      currentIssue: nation.currentIssue ? JSON.parse(nation.currentIssue) : null,
      history: JSON.parse(nation.decisionHistory),
      historyLog: JSON.parse(nation.historyLog),
    })));
  } catch (error) {
    console.error("Failed to fetch nations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
