import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";




export async function GET(request, { params }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            price: true,
            description: true,
            slug: true,
            stock: true,
            sizes: true,
            gender: true,
            tags: true,
            images: { select: { url: true } },
            user: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    isActive: true,
                    roles: true,
                },
            },
        },
    });

    const formattedProduct = {
        ...product,
        images: product.images.map((image) => image.url),
    };
    return NextResponse.json(formattedProduct);
}