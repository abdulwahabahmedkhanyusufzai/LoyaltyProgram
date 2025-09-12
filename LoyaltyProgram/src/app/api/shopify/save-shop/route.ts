//app /api /shopify /save - shop / route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { shop } = body;

    if (!shop) {
      return NextResponse.json({ message: 'Shop is required' }, { status: 400 });
    }

    // First try to find existing shop and user
    let shopResponse = await prisma.shop.findFirst({
      where: { shop },
      include: {
        users: true
      }
    });

    if (shopResponse && shopResponse.users && shopResponse.users.length > 0) {
      // Shop and user already exist, return existing data
      return NextResponse.json({
        message: 'Shop and user already exist',
        userId: shopResponse.users[0].id,
        shop: shopResponse
      }, { status: 200 });
    }

    // Transaction to ensure both shop and user are created or neither is
    const result = await prisma.$transaction(async (prisma) => {
      // Create or update shop
      const shopData = await prisma.shop.upsert({
        where: { shop },
        update: {},
        create: {
          shop,
          accessToken: 'defaultAccessToken',
          scope: 'defaultScope',
        },
      });

      // Create user only if it doesn't exist for this shop
      const userData = await prisma.user.create({
        data: {
          shop:{
            connect:{id:shopData.id},
          }
        },
      });

      return { shop: shopData, user: userData };
    });

    return NextResponse.json({
      message: 'Shop and user saved successfully',
      userId: result.user.email,
      shop: result.shop
    }, { status: 200 });

  } catch (error) {
    console.error('Error saving shop:', error);
    
    // Handle specific error cases
    if (error.code === 'P2002') {
      return NextResponse.json({
        message: 'A unique constraint violation occurred. Please try again.',
        error: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      message: 'Internal Server Error',
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}