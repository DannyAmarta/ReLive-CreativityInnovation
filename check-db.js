const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tx = await prisma.paymentTransaction.findUnique({
    where: { gatewayTxId: 'DS3078426XW2YL4YFDLYZNXM' }
  });
  console.log('Payment Transaction:', tx);

  if (tx) {
    const booking = await prisma.booking.findUnique({
      where: { id: tx.bookingId }
    });
    console.log('Associated Booking:', booking);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
