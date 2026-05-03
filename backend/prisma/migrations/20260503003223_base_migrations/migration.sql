/*
  Warnings:

  - You are about to drop the column `imagen_url` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the `OrderItems` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image_url` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_itemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItems" DROP CONSTRAINT "OrderItems_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "imagen_url",
DROP COLUMN "precio",
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "state" SET DEFAULT 'pending';

-- DropTable
DROP TABLE "OrderItems";

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
