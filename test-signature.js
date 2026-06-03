require('dotenv').config({ path: 'apps/backend/.env' });
const crypto = require('crypto');

const apiKey = process.env.DUITKU_API_KEY;
if (!apiKey) {
  console.log('NO API KEY FOUND in apps/backend/.env');
  process.exit(1);
}

const payload = {
  merchantCode: 'DS30784',
  amount: '157750',
  merchantOrderId: 'BOOK-114-1780334022301',
  resultCode: '00',
  reference: 'DS3078426XW2YL4YFDLYZNXM',
  signature: '5f21f860785e74f281914be1f5e4cb5e'
};

const hash = (str) => crypto.createHash('md5').update(str).digest('hex');
const hash256 = (str) => crypto.createHash('sha256').update(str).digest('hex');

const combinations = {
  'merchantCode + amount + merchantOrderId + apiKey (MD5)': hash(payload.merchantCode + payload.amount + payload.merchantOrderId + apiKey),
  'merchantCode + amount + merchantOrderId + apiKey (SHA256)': hash256(payload.merchantCode + payload.amount + payload.merchantOrderId + apiKey),
  
  'merchantCode + amount + merchantOrderId + resultCode + apiKey (MD5)': hash(payload.merchantCode + payload.amount + payload.merchantOrderId + payload.resultCode + apiKey),
  'merchantCode + amount + merchantOrderId + resultCode + apiKey (SHA256)': hash256(payload.merchantCode + payload.amount + payload.merchantOrderId + payload.resultCode + apiKey),

  'merchantCode + merchantOrderId + amount + apiKey (MD5)': hash(payload.merchantCode + payload.merchantOrderId + payload.amount + apiKey),
  
  'merchantCode + amount + reference + apiKey (MD5)': hash(payload.merchantCode + payload.amount + payload.reference + apiKey),
};

console.log('Target Signature:', payload.signature);
let found = false;
for (const [name, result] of Object.entries(combinations)) {
  if (result === payload.signature) {
    console.log(`\n✅ MATCH FOUND!!! Formula is: ${name}`);
    found = true;
  }
}

if (!found) {
  console.log('\n❌ No combination matched. The API KEY might be wrong, or it uses another format.');
  console.log('Tested hashes:');
  console.log(combinations);
}
