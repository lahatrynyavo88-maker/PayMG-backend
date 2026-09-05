
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'PayMG Backend NIAVO running!' });
});

app.post('/api/pay', (req, res) => {
  const { amount, phone } = req.body;
  console.log(`Pay NIAVO: ${amount} - ${phone}`);
  res.json({ success: true, amount, phone, status: 'pending' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NIAVO on ${PORT}`));
