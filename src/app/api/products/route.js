import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";




export async function GET(request) {

    const offset = +request.nextUrl.searchParams.get("offset") || 0;
    const limit = +request.nextUrl.searchParams.get("limit") || 10;

    const select = {
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
    };

    const products = await prisma.product.findMany({ select, take: limit, skip: offset });

    const formattedProducts = products.map(product => ({
        ...product,
        images: product.images.map(image => image.url),
    }));

    return NextResponse.json(formattedProducts);
}




export async function POST(request) {
    const body = await request.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
}