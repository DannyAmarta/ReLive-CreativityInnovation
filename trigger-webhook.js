const payload = new URLSearchParams({
  merchantCode: 'DS30784',
  amount: '157750',
  merchantOrderId: 'BOOK-114-1780334022301',
  productDetail: 'Booking #114 - mewing',
  additionalParam: '',
  resultCode: '00',
  paymentCode: 'VA',
  merchantUserId: '',
  reference: 'DS3078426XW2YL4YFDLYZNXM',
  signature: '5f21f860785e74f281914be1f5e4cb5e',
  publisherOrderId: 'VA26S2A54CAI1Z1H810',
  settlementDate: '2026-06-03',
  vaNumber: '7828701906919145',
  sourceAccount: ''
});

fetch('http://localhost:8000/api/webhooks/duitku', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: payload
})
.then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
})
.catch(console.error);
