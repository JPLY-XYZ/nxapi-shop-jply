import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";




export async function GET(request, { params }) {
    const { id: idOrSlug } = await params;

    const product = await prisma.product.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
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

    if (!product) {
        return NextResponse.json(
            { message: "Product not found" },
            { status: 404 }
        );
    }

    const formattedProduct = {
        ...product,
        images: product.images.map((image) => image.url),
    };
    return NextResponse.json(
        formattedProduct,
        { status: 200 }
    );
}




export async function PATCH(request, { params }) {
    const { id } = await params;

    const token = request.headers.get("Authorization");

    // VERIFICAMOS TOKEN
    const { idUser } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: idUser } });

    if (!user) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        )
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        return NextResponse.json(
            { message: "Product not found" },
            { status: 404 }
        );
    }

    const body = await request.json();

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
            ...body,
            ...(body.images &&
                { images: { create: body.images.map(image => ({ url: image })) } }),
        },
        // incluimos las imágenes en la respuesta
        include: {
            images: true,
        }
    });

    return NextResponse.json(
        updatedProduct,
        { status: 200 }
    );
}




export async function DELETE(request, { params }) {
    const { id } = await params;

    const token = request.headers.get("Authorization");

    // VERIFICAMOS TOKEN
    const { idUser } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: idUser } });

    if (!user) {
        return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
        )
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
        return NextResponse.json(
            { message: "Product not found" },
            { status: 404 }
        );
    }

    const deletedProduct = await prisma.product.delete({
        where: { id },
        // incluimos las imágenes en la respuesta
        include: {
            images: true,
        }
    });

    return NextResponse.json(
        deletedProduct,
        { status: 200 }
    );
}



