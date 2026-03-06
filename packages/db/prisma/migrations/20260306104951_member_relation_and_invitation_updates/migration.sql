-- DropIndex
DROP INDEX "invitations_linked_member_profile_id_key";

-- AlterTable
ALTER TABLE "household_members" ADD COLUMN     "display_name" VARCHAR(100),
ADD COLUMN     "relation" VARCHAR(50),
ALTER COLUMN "user_id" DROP NOT NULL;
