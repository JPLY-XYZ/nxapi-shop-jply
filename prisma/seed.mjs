import users from './data/users.json' with { type: 'json' };
import products from './data/products.json' with { type: 'json' };
import productImages from './data/product_images.json' with { type: 'json' };

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // 1. PELIGRO: Borrar todo
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

    console.log("Añadiendo imágenes...")
    await prisma.productImage.createMany({
        data: productImages,
        skipDuplicates: true,
    });

    console.log("Listo!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
