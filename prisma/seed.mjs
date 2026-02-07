import users from './data/users.json' with { type: 'json' };
import products from './data/products.json' with { type: 'json' };
import productImages from './data/product_images.json' with { type: 'json' };
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
    // PELIGRO: Borramos todo
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

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

    // console.log("Añadiendo imágenes...")
    // await prisma.productImage.createMany({
    //     data: productImages,
    //     skipDuplicates: true,
    // });


    for (const img of productImages) {
        try {
            // 1. Subir a Cloudinary
            const result = await cloudinary.uploader.upload(`public/products/${img.url}`, {
                folder: 'shop',
                use_filename: true,
                unique_filename: false,
            });

            // 2. Crear registro en Prisma con la URL resultante
            await prisma.productImage.create({
                data: {
                    url: result.secure_url,
                    productId: img.productId,
                },
            });

            console.log(`✅ Subida: ${img.url}`);
        } catch (error) {
            console.error(`❌ Error con ${img.url}:`, error);
        }
    }

    console.log("Listo!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
