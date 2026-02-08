import { users, products, productImages } from './data.mjs';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resetDatabase = async () => {
    console.log("Reiniciando base de datos (TRUNCATE)...");
    // PostgreSQL
    await prisma.$executeRaw`TRUNCATE TABLE "users", "products", "product_images" RESTART IDENTITY CASCADE;`;
}


async function main() {
    // PELIGRO: Borramos todo
    await resetDatabase()

    console.log("Añadiendo usuarios...")
    await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
    });

    console.log("Añadiendo productos...")
    await prisma.product.createMany({
        data: products,
        skipDuplicates: true,
    });

    console.log("Añadiendo imágenes...")
    // await prisma.productImage.createMany({
    //     data: productImages,
    //     skipDuplicates: true,
    // });

    for (const img of productImages) {
        try {
            const result = await cloudinary.uploader.upload(`public/products/${img.url}.jpg`, {
                folder: 'shop',
                use_filename: true,
                unique_filename: false,
            });

            // IMPORTANTE: Debes guardar el public_id que devuelve Cloudinary
            // Si el archivo se llama "foto1", result.public_id será "shop/foto1"
            await prisma.productImage.create({
                data: {
                    url: result.public_id, // Guarda esto para usarlo en el GET
                    productId: img.productId,
                },
            });

            console.log(`✅ Subida: ${result.public_id}`);
        } catch (error) {
            console.error(`❌ Error con ${img.url}:`, error);
        }
    }
    console.log("Listo!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
