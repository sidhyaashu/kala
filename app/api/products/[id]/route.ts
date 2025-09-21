import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH function to update a product (e.g., change its status)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
        return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE function to remove a product
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
     if (!id) {
        return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}