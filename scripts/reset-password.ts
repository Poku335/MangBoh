import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import readline from "readline"

const prisma = new PrismaClient()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res))

async function main() {
  const email = await ask("Email ของ user: ")

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } })
  if (!user) {
    console.error(`ไม่พบ user: ${email}`)
    process.exit(1)
  }

  console.log(`พบ: ${user.name} (${user.email})`)
  const newPassword = await ask("Password ใหม่: ")

  if (newPassword.length < 8) {
    console.error("Password ต้องมีอย่างน้อย 8 ตัวอักษร")
    process.exit(1)
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { email }, data: { password: hash } })

  console.log(`✓ รีเซ็ต password ของ ${user.email} เรียบร้อยแล้ว`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => { rl.close(); prisma.$disconnect() })
