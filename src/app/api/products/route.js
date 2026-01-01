import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";



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
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        )
    }

    const token = authHeader.split(' ')[1] || authHeader;

    // VERIFICAMOS TOKEN
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        )
    }

    try {
        const { title, price, description, slug, stock, sizes, gender, tags, images } = await request.json();

        if (!title || price === undefined || !slug || stock === undefined || !sizes || !gender || !tags || !images) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            )
        }

        const product = await prisma.product.create({
            data: {
                title,
                price,
                description,
                slug,
                stock,
                sizes,
                gender,
                tags,
                images: {
                    create: images.map(image => ({ url: image }))
                },
                userId: id,
            },
            // incluimos las imágenes en la respuesta
            include: {
                images: true,
            }
        });
        return NextResponse.json(
            product,
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}