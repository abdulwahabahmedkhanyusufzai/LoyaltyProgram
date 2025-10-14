import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
  req: Request,
  context: RouteContext<"/api/loyalty-program/[id]">
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 });
  }

  try {
    // 🔹 Run both deletes in a single transaction
    const [deletedLedger, deletedCustomer] = await prisma.$transaction([
      prisma.pointsLedger.deleteMany({ where: { customerId: id } }),
      prisma.customer.delete({ where: { id } }),
    ]);

    return NextResponse.json(
      {
        message: "Customer deleted",
        customer: deletedCustomer,
        removedLedgerEntries: deletedLedger.count, // shows how many ledger rows were cleaned up
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Error deleting customer:", err);

    if (err.code === "P2025") {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Failed to delete customer", error: err.message },
      { status: 500 }
    );
  }
}
