/*
  Warnings:

  - You are about to drop the column `productId` on the `OrderItems` table. All the data in the column will be lost.
  - You are about to drop the `Productos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemId` to the `OrderItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_productId_fkey";

-- AlterTable
ALTER TABLE "OrderItems" DROP COLUMN "productId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Productos";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "imagen_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
