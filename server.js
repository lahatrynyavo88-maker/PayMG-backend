hereEny. Ity no code feno mifanaraka amin'ny documentation officielle Papi. Izy io dia mampiasa PAPI_API_KEY avy amin'ny Railway, ka tsy apetraka ao amin'ny code 
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PAPI_API_URL =
  'https://app.papi.mg/dashboard/api/payment-links';

const PAPI_API_KEY = process.env.PAPI_API_KEY;

const BACKEND_URL =
  'https://paymg-backend-production.up.railway.app';


// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PayMG Backend NIAVO running!'
  });
});


// =====================================================
// CREATE PAPI PAYMENT
// POST /api/pay
// =====================================================

app.post('/api/pay', async (req, res) => {
  try {
    const {
      amount,
      phone,
      clientName,
      reference,
      description,
      provider
    } = req.body;

    // Check API key
    if (!PAPI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PAPI_API_KEY is not configured'
      });
    }

    // Validate amount
    if (!amount || Number(amount) < 300) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 300 MGA'
      });
    }

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Generate reference if not provided
    const paymentReference =
      reference ||
      `PAYMG-${Date.now()}`;

    // Provider
    const selectedProvider =
      provider || 'MVOLA';

    // Papi request body
    const papiBody = {
      amount: Number(amount),

      clientName:
        clientName || 'PayMG Customer',

      reference:
        paymentReference,

      description:
        description || `PayMG payment ${paymentReference}`,

      successUrl:
        `${BACKEND_URL}/payment-success`,

      failureUrl:
        `${BACKEND_URL}/payment-failure`,

      notificationUrl:
        `${BACKEND_URL}/api/payment-notify`,

      validDuration: 1,

      provider:
        selectedProvider,

      payerPhone:
        phone,

      isTestMode: false
    };


    // Call Papi API
    const response = await fetch(PAPI_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'Token': PAPI_API_KEY
      },

      body: JSON.stringify(papiBody)
    });


    const result = await response.json();


    // Papi error
    if (!response.ok) {
      console.error('Papi error:', result);

      return res.status(response.status).json({
        success: false,
        error: result.error || 'Papi API error'
      });
    }


    // Payment link not returned
    if (!result.data || !result.data.paymentLink) {
      console.error('Unexpected Papi response:', result);

      return res.status(502).json({
        success: false,
        error: 'Papi did not return a payment link'
      });
    }


    // Return payment link to PayMG
    return res.json({
      success: true,

      status: 'pending',

      reference:
        result.data.paymentReference,

      amount:
        result.data.amount,

      currency:
        result.data.currency,

      paymentLink:
        result.data.paymentLink,

      notificationToken:
        result.data.notificationToken
    });


  } catch (error) {

    console.error('PayMG /api/pay error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to create payment'
    });
  }
});


// =====================================================
// PAPI PAYMENT NOTIFICATION
// POST /api/payment-notify
// =====================================================

app.post('/api/payment-notify', async (req, res) => {

  try {

    const notification = req.body;

    console.log(
      'Papi notification:',
      JSON.stringify(notification)
    );


    const {
      paymentStatus,
      paymentReference,
      notificationToken,
      amount,
      paymentMethod,
      payerPhone
    } = notification;


    // Basic validation
    if (!paymentReference || !notificationToken) {

      return res.status(400).json({
        success: false,
        error: 'Invalid notification'
      });

    }


    // IMPORTANT:
    // In production, compare notificationToken
    // with the token saved when the payment was created.
    //
    // Also compare paymentReference with your
    // own stored payment record.


    if (paymentStatus === 'SUCCESS') {

      console.log(
        `PAYMENT SUCCESS: ${paymentReference}`
      );

      console.log(
        `Amount: ${amount}`
      );

      console.log(
        `Method: ${paymentMethod}`
      );

      console.log(
        `Phone: ${payerPhone}`
      );


      // TODO:
      // Update your database here:
      //
      // payment.status = 'SUCCESS';


    } else if (paymentStatus === 'FAILED') {

      console.log(
        `PAYMENT FAILED: ${paymentReference}`
      );

      // TODO:
      // Update database:
      //
      // payment.status = 'FAILED';


    } else {

      console.log(
        `PAYMENT STATUS: ${paymentStatus}`
      );

      // PENDING or other status
    }


    return res.json({
      success: true
    });


  } catch (error) {

    console.error(
      'Notification error:',
      error
    );

    return res.status(500).json({
      success: false
    });

  }

});


// =====================================================
// PAYMENT SUCCESS PAGE
// =====================================================

app.get('/payment-success', (req, res) => {

  res.send(`
    <html>
      <head>
        <title>PayMG Payment</title>
      </head>

      <body>
        <h2>Paiement réussi</h2>
        <p>Merci. Votre paiement a été traité.</p>
      </body>
    </html>
  `);

});


// =====================================================
// PAYMENT FAILURE PAGE
// =====================================================

app.get('/payment-failure', (req, res) => {

  res.send(`
    <html>
      <head>
        <title>PayMG Payment</title>
      </head>

      <body>
        <h2>Paiement échoué</h2>
        <p>Le paiement n'a pas abouti.</p>
      </body>
    </html>
  `);

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

  console.log(
    `PayMG Backend NIAVO running on port ${PORT}`
  );

});
Aorian'izay
Ao amin'ny Railway → Variables dia tokony hisy:
PAPI_API_KEY → ilay API Key Papi-nao
Ary tsy mila mametraka ilay key ao amin'ny code.
Avy eo Redeploy ilay service.
⚠️ Misy zavatra iray mbola tsy vita amin'ity version ity: ny notificationToken dia mbola tsy tehirizina ao amin'ny database. Papi milaza fa tokony hotehirizina ilay token ary ampitahaina amin'ny token tonga amin'ny notification mba hanamarinana fa tena avy amin'i Papi ilay paiement. �
Papi
Noho izany, aza mbola raisina ho rafitra production vonona handray vola ity. Dingana manaraka dia ny fanaovana test POST /api/pay ary avy eo amboarina ny verification/database.Eny. Ity no code feno mifanaraka amin'ny documentation officielle Papi. Izy io dia mampiasa PAPI_API_KEY avy amin'ny Railway, ka tsy apetraka ao amin'ny code mihitsy ny key. Papi dia mitaky notificationUrl, ary tokony hohamarinina amin'ny paymentReference + notificationToken ny notification. �
Papi
Soloy manontolo ilay code taloha amin'ity:
Rédaction
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PAPI_API_URL =
  'https://app.papi.mg/dashboard/api/payment-links';

const PAPI_API_KEY = process.env.PAPI_API_KEY;

const BACKEND_URL =
  'https://paymg-backend-production.up.railway.app';


// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PayMG Backend NIAVO running!'
  });
});


// =====================================================
// CREATE PAPI PAYMENT
// POST /api/pay
// =====================================================

app.post('/api/pay', async (req, res) => {
  try {
    const {
      amount,
      phone,
      clientName,
      reference,
      description,
      provider
    } = req.body;

    // Check API key
    if (!PAPI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'PAPI_API_KEY is not configured'
      });
    }

    // Validate amount
    if (!amount || Number(amount) < 300) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 300 MGA'
      });
    }

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Generate reference if not provided
    const paymentReference =
      reference ||
      `PAYMG-${Date.now()}`;

    // Provider
    const selectedProvider =
      provider || 'MVOLA';

    // Papi request body
    const papiBody = {
      amount: Number(amount),

      clientName:
        clientName || 'PayMG Customer',

      reference:
        paymentReference,

      description:
        description || `PayMG payment ${paymentReference}`,

      successUrl:
        `${BACKEND_URL}/payment-success`,

      failureUrl:
        `${BACKEND_URL}/payment-failure`,

      notificationUrl:
        `${BACKEND_URL}/api/payment-notify`,

      validDuration: 1,

      provider:
        selectedProvider,

      payerPhone:
        phone,

      isTestMode: false
    };


    // Call Papi API
    const response = await fetch(PAPI_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'Token': PAPI_API_KEY
      },

      body: JSON.stringify(papiBody)
    });


    const result = await response.json();


    // Papi error
    if (!response.ok) {
      console.error('Papi error:', result);

      return res.status(response.status).json({
        success: false,
        error: result.error || 'Papi API error'
      });
    }


    // Payment link not returned
    if (!result.data || !result.data.paymentLink) {
      console.error('Unexpected Papi response:', result);

      return res.status(502).json({
        success: false,
        error: 'Papi did not return a payment link'
      });
    }


    // Return payment link to PayMG
    return res.json({
      success: true,

      status: 'pending',

      reference:
        result.data.paymentReference,

      amount:
        result.data.amount,

      currency:
        result.data.currency,

      paymentLink:
        result.data.paymentLink,

      notificationToken:
        result.data.notificationToken
    });


  } catch (error) {

    console.error('PayMG /api/pay error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to create payment'
    });
  }
});


// =====================================================
// PAPI PAYMENT NOTIFICATION
// POST /api/payment-notify
// =====================================================

app.post('/api/payment-notify', async (req, res) => {

  try {

    const notification = req.body;

    console.log(
      'Papi notification:',
      JSON.stringify(notification)
    );


    const {
      paymentStatus,
      paymentReference,
      notificationToken,
      amount,
      paymentMethod,
      payerPhone
    } = notification;


    // Basic validation
    if (!paymentReference || !notificationToken) {

      return res.status(400).json({
        success: false,
        error: 'Invalid notification'
      });

    }


    // IMPORTANT:
    // In production, compare notificationToken
    // with the token saved when the payment was created.
    //
    // Also compare paymentReference with your
    // own stored payment record.


    if (paymentStatus === 'SUCCESS') {

      console.log(
        `PAYMENT SUCCESS: ${paymentReference}`
      );

      console.log(
        `Amount: ${amount}`
      );

      console.log(
        `Method: ${paymentMethod}`
      );

      console.log(
        `Phone: ${payerPhone}`
      );


      // TODO:
      // Update your database here:
      //
      // payment.status = 'SUCCESS';


    } else if (paymentStatus === 'FAILED') {

      console.log(
        `PAYMENT FAILED: ${paymentReference}`
      );

      // TODO:
      // Update database:
      //
      // payment.status = 'FAILED';


    } else {

      console.log(
        `PAYMENT STATUS: ${paymentStatus}`
      );

      // PENDING or other status
    }


    return res.json({
      success: true
    });


  } catch (error) {

    console.error(
      'Notification error:',
      error
    );

    return res.status(500).json({
      success: false
    });

  }

});


// =====================================================
// PAYMENT SUCCESS PAGE
// =====================================================

app.get('/payment-success', (req, res) => {

  res.send(`
    <html>
      <head>
        <title>PayMG Payment</title>
      </head>

      <body>
        <h2>Paiement réussi</h2>
        <p>Merci. Votre paiement a été traité.</p>
      </body>
    </html>
  `);

});


// =====================================================
// PAYMENT FAILURE PAGE
// =====================================================

app.get('/payment-failure', (req, res) => {

  res.send(`
    <html>
      <head>
        <title>PayMG Payment</title>
      </head>

      <body>
        <h2>Paiement échoué</h2>
        <p>Le paiement n'a pas abouti.</p>
      </body>
    </html>
  `);

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

  console.log(
    `PayMG Backend NIAVO running on port ${PORT}`
  );

});
