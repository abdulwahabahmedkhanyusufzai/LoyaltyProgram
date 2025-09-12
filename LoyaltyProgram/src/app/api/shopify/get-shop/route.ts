import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { shopName } = await request.json();

    if (!shopName) {
      return NextResponse.json(
        { error: 'Missing shopName in request body' },
        { status: 400 }
      );
    }

    // Fetch the shop from the database using shopName
    const shop = await prisma.shop.findUnique({
      where: { shop: shopName },
    });

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Return the shop URL
    return NextResponse.json({ shopUrl: shop.shop });
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
