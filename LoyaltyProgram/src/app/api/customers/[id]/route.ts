import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; // adjust path to your prisma client

const prisma = new PrismaClient();

export async function DELETE(req: Request,context: RouteContext<'/api/loyalty-program/[id]'>) {
  const  {id } = await context.params;


  if (!id) {
    return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 });
  }

  try {
        await prisma.pointsLedger.deleteMany({ where: { customerId: id } });

    // Delete customer
    const deletedCustomer = await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Customer deleted", customer: deletedCustomer },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error deleting customer:", err);

    if (err.code === "P2025") {
      // Prisma error: record not found
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Failed to delete customer" }, { status: 500 });
  }
}
