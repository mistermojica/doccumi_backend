// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.

const express = require("express");
const cors = require("cors");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const url = require("node:url");
const querystring = require("node:querystring");
const os = require("os");

// Replace if using a different env file or config
require("dotenv").config({ path: "./.env" });

const entities = new Map();

const STRIPE_SECRET_KEY = req.headers.host === 'localhost:8000' ? process.env.DEV_STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = req.headers.host === 'localhost:8000' ? process.env.DEV_STRIPE_PUBLISHABLE_KEY : process.env.STRIPE_PUBLISHABLE_KEY;
const STATIC_DIR = process.env.STATIC_DIR;

const hostName = os.hostname();

console.log({hostName});

if (
  !STRIPE_SECRET_KEY ||
  !STRIPE_PUBLISHABLE_KEY ||
  !STATIC_DIR
) {
  console.log(
    "The .env file is not configured. Follow the instructions in the readme to configure the .env file. https://github.com/stripe-samples/subscription-use-cases"
  );
  console.log("");
  STRIPE_SECRET_KEY
    ? ""
    : console.log("Add STRIPE_SECRET_KEY to your .env file.");

  STRIPE_PUBLISHABLE_KEY
    ? ""
    : console.log("Add STRIPE_PUBLISHABLE_KEY to your .env file.");

  STATIC_DIR
    ? ""
    : console.log(
        "Add STATIC_DIR to your .env file. Check .env.example in the root folder for an example"
      );

  process.exit();
}

const stripe = require("stripe")(STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
  appInfo: {
    // For sample support and debugging, not required for production:
    name: "stripe-samples/subscription-use-cases/fixed-price",
    version: "0.0.1",
    url: "https://github.com/stripe-samples/subscription-use-cases/fixed-price",
  },
});

// Use static to serve static assets.
app.use(express.static(STATIC_DIR));

// Use cookies to simulate logged in user.
app.use(cookieParser());

// Use CORS
app.use(cors());

// Use JSON parser for parsing payloads as JSON on all non-webhook routes.
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  // console.log("calculateOrderAmount:", {items});
  
  return items.amount;
};

app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const path = resolve(STATIC_DIR + "/register.html");
  res.sendFile(path);
});

app.get("/doccumi-payment-response", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const myUrl = url.parse(req.originalUrl);
  res.send(querystring.parse(myUrl.query));
});

app.post("/create-payment-intent", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  console.log('create-payment-intent:', req.body);

  const {items} = req.body;
  // Alternatively, set up a webhook to listen for the payment_intent.succeeded event
  // and attach the PaymentMethod to a new Customer
  // const customer = await stripe.customers.create();
  // const customerId = req.cookies["customer"];
  const customerId = req.body.customerId;

  // console.log({customerId});

  const price = await stripe.prices.retrieve(req.body.priceId);

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customerId,
    setup_future_usage: "off_session",
    amount: price.unit_amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // console.log({paymentIntent});
  // console.log(paymentIntent.client_secret);

  res.send({
    clientSecret: paymentIntent.client_secret,
    // paymentMethodOptions: paymentIntent.payment_method_options
  });
});

app.get("/prices", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const customerId = req.body.customerId;

  const prices = await stripe.prices.list({
    // lookup_keys: ['sample_basic', 'sample_premium'],
    expand: ["data.product"],
    limit: 3,
  });

  entities.set("prices", prices);

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active"
  });

  const result = {
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    prices: prices.data,
    currentPriceId: subscriptions?.data[0]?.items?.data[0]?.price?.id
  };

  // console.log({result});

  res.send(result);
});

app.post("/create-customer", async (req, res) => {
  // req.headers.append('Access-Control-Allow-Origin', 'http://localhost:8004');
  // req.headers.append('Access-Control-Allow-Credentials', 'true');

  // res.header("Access-Control-Allow-Origin", "http://localhost:8004");
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );

  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
    name: req.body.name,
  });

  entities.set("customerId", customer.id);

  // Save the customer.id in your database alongside your user.
  // We're simulating authentication with a cookie.
  res.cookie("customer", customer.id, { maxAge: 900000, httpOnly: true });
  res.cookie.customer = customer.id;

  console.log("cookies:", req.cookies);
  console.log("customer:", { customer });

  res.send({ customer });
});

app.post("/create-subscription", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Simulate authenticated user. In practice this will be the
  // Stripe Customer ID related to the authenticated user.
  // const customerId = req.cookies['customer'];

  console.log('create-subscription:', req.body);

  const customerId = req.body.customerId; //entities.get("customerId");
  const priceId = req.body.priceId;

  // const subscriptions = await stripe.subscriptions.list({
  //   customer: customerId,
  //   status: "active",
  // });

  const customer = await stripe.customers.retrieve(customerId, {});

  const paymentMethodId = customer.invoice_settings.default_payment_method;
  if (!paymentMethodId){
    res.send({
      status: false,
      message: "Este cliente no tiene un método de pago predeterminado.",
      result: {},
    });
  }

  // PARA CREAR NUEVO METODO DE PAGO
  // const paymentMethod = await stripe.paymentMethods.create({
  //   type: "card",
  //   card: {
  //     number: "4242424242424242",
  //     exp_month: 6,
  //     exp_year: 2024,
  //     cvc: "314",
  //   },
  // });

  // paymentMethodId = paymentMethod.id;

  // ESTO SOLO DEBO HACERLO AL CREAR UN CLIENTE O SI UN CLIENTE NO TIENE UN METODO DE PAGO POR DEFECTO
  // const attachPaymentToCustomer = await stripe.paymentMethods.attach(
  //   paymentMethodId, // <-- your payment method ID collected via Stripe.js
  //   { customer: customerId } // <-- your customer id from the request body
  // );

  // ESTO SOLO DEBO HACERLO AL CREAR UN CLIENTE O SI UN CLIENTE NO TIENE UN METODO DE PAGO POR DEFECTO
  // const updateCustomerDefaultPaymentMethod = await stripe.customers.update(
  //   customerId,
  //   {
  //     // <-- your customer id from the request body
  //     invoice_settings: {
  //       default_payment_method: paymentMethodId, // <-- your payment method ID collected via Stripe.js
  //     },
  //   }
  // );

  // if (subscriptions.data.length > 0) {
    
  // } else {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        payment_behavior: "default_incomplete",
        // collection_method: "charge_automatically",
        expand: ["latest_invoice.payment_intent"]
      });

      console.log("create - subscription:", {subscription});

      res.send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        items: subscription.items.data,
        subscription: subscription,
      });
    } catch (error) {
      return res.status(400).send({ code: '222', error: { message: error.message } });
    }
  // }
});

app.post("/update-subscription", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // console.log("update-subscription:", req.body);

  try {
    const priceId = req.body.priceId;
    const subscriptionId = req.body.subscriptionId;
    const customerId = req.body.customerId;
    const customer = await stripe.customers.retrieve(customerId, {});
    const paymentMethodId = customer.invoice_settings.default_payment_method;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice.payment_intent"],
    });

    // console.log('update-subscription:', {subscription});

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        proration_behavior: "create_prorations",
        expand: ["latest_invoice.payment_intent"],
        // collection_method: "charge_automatically",
        payment_settings: {
          payment_method_types: ["card"]
        },
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
            quantity: 1
          }
        ],
        default_payment_method: paymentMethodId
      }
    );


    // console.log('subscription.latest_invoice.payment_intent:', subscription.latest_invoice.payment_intent);
    // console.log('subscription.latest_invoice.billing_reason:', subscription.latest_invoice.billing_reason);
    // console.log('paymentMethodId 111:', paymentMethodId);

    if (subscription.latest_invoice.billing_reason == "subscription_create") {
      // The subscription automatically activates after successful payment
      // Set the payment method used to pay the first invoice
      // as the default payment method for that subscription
      const paymentIntentId = subscription.latest_invoice.payment_intent.id;

      // Retrieve the payment intent used to pay the subscription
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   paymentIntentId
      // );

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {payment_method: paymentMethodId}
      );

      // console.log('paymentMethodId 111:', paymentMethodId);

      // try {
      //   const subscriptionN = await stripe.subscriptions.update(
      //     subscriptionId,
      //     {
      //       default_payment_method: paymentMethodId,
      //     }
      //   );

      //   console.log({subscriptionN});

      //   console.log("Default payment method set for subscription 3:", paymentMethodId);
      // } catch (err) {
      //   console.log(err);
      //   console.log(
      //     `⚠️  Falied to update the default payment method for subscription: ${subscriptionId}`
      //   );
      // }
    }

    const subscriptionN = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice.payment_intent"],
    });

    // console.log('update-subscription:', {subscriptionN});

    // console.log("update - updatedSubscription:", {updatedSubscription});

    console.log('updatedSubscription.latest_invoice.payment_intent:', {
      subscriptionId: subscriptionId,
      clientSecret: updatedSubscription.latest_invoice.payment_intent.client_secret,
      message: "Subscripción modificada."
    });

    res.send({
      subscriptionId: subscriptionId,
      clientSecret: updatedSubscription.latest_invoice.payment_intent.client_secret,
      message: "Subscripción modificada."
    });
  } catch (error) {
    return res.status(400).send({ code: '111', error: { message: error.message } });
  }

  // try {
  //   const subscription = await stripe.subscriptions.retrieve(
  //     req.body.subscriptionId
  //   );
  //   const updatedSubscription = await stripe.subscriptions.update(
  //     req.body.subscriptionId,
  //     {
  //       items: [
  //         {
  //           id: subscription.items.data[0].id,
  //           price: process.env[req.body.newPriceLookupKey.toUpperCase()],
  //         },
  //       ],
  //     }
  //   );

  //   res.send({ subscription: updatedSubscription });
  // } catch (error) {
  //   return res.status(400).send({ error: { message: error.message } });
  // }
});

app.get("/list-payment-methods", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // List payment methods
  try {
    // const customerId = req.body.customerId;
    // const customerId = req.cookies["customer"];
    const customerId = req.body.customerId;

    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      {type: "card"}
    );

    res.send({ cards: paymentMethods.data });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post("/set-default-payment-method", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // console.log('set-default-payment-method:', req.body);

  const customerId = req.body.customerId;
  const paymentMethodId = req.body.paymentMethodId;

  try {
    const customer = await stripe.customers.update(
      customerId,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId
        },
        metadata: {
          order_id: 'DOCCUMI-0000001'
        }
      }
    );

    // console.log({customer});

    res.send({ customerUpdated: customer });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post("/delete-payment-method", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // console.log('delete-payment-method:', req.body);

  // List payment methods
  try {
    const paymentId = req.body.paymentMethodId;
    const paymentMethod = await stripe.paymentMethods.detach(
      paymentId
    );

    // console.log({paymentMethod});

    res.send({ paymentMethod: paymentMethod });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.get("/load-customer", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // List payment methods
  try {
    // const customerId = req.body.customerId;
    // const customerId = req.cookies["customer"];
    const customerId = req.body.customerId;
    const customer = await stripe.customers.retrieve(customerId, {
      // expand: ["default_payment_method"]
    });

    // console.log('load-customer:', customer.invoice_settings.default_payment_method);

    res.send({ customer: customer });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post("/invoice-preview", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const customerId = req.body.customerId;
  const priceId = req.body.priceId;
  const subscriptionId = req.body.subscriptionId;

  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId
  );

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: subscriptionId,
    subscription_items: [
      {
        id: subscription.items.data[0].id,
        price: priceId
      }
    ]
  });

  res.send({invoice});
});

app.post("/cancel-subscription", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Cancel the subscription
  try {
    const deletedSubscription = await stripe.subscriptions.del(
      req.body.subscriptionId
    );

    res.send({ subscription: deletedSubscription });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.get("/subscriptions", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Simulate authenticated user. In practice this will be the
  // Stripe Customer ID related to the authenticated user.
  const customerId = req.body.customerId;
  console.log({customerId});

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    expand: ["data.default_payment_method", "data.plan.product", "data.latest_invoice"],
  });

  res.json({ subscriptions });
});

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.header("Stripe-Signature"),
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      console.log(`⚠️  Webhook signature verification failed.`);
      console.log(
        `⚠️  Check the env file and enter the correct webhook secret.`
      );
      return res.sendStatus(400);
    }

    // Extract the object from the event.
    const dataObject = event.data.object;

    // Handle the event
    // Review important events for Billing webhooks
    // https://stripe.com/docs/billing/webhooks
    // Remove comment to see the various objects sent for this sample
    switch (event.type) {
      case "invoice.payment_succeeded":
        if (dataObject["billing_reason"] == "subscription_create") {
          // The subscription automatically activates after successful payment
          // Set the payment method used to pay the first invoice
          // as the default payment method for that subscription
          const subscription_id = dataObject["subscription"];
          const payment_intent_id = dataObject["payment_intent"];

          // Retrieve the payment intent used to pay the subscription
          const payment_intent = await stripe.paymentIntents.retrieve(
            payment_intent_id
          );

          try {
            const subscription = await stripe.subscriptions.update(
              subscription_id,
              {
                default_payment_method: payment_intent.payment_method,
              }
            );

            console.log(
              "Default payment method set for subscription:" +
                payment_intent.payment_method
            );
          } catch (err) {
            console.log(err);
            console.log(
              `⚠️  Falied to update the default payment method for subscription: ${subscription_id}`
            );
          }
        }

        break;
      case "invoice.payment_failed":
        // If the payment fails or the customer does not have a valid payment method,
        //  an invoice.payment_failed event is sent, the subscription becomes past_due.
        // Use this webhook to notify your user that their payment has
        // failed and to retrieve new card details.
        break;
      case "invoice.finalized":
        // If you want to manually send out invoices to your customers
        // or store them locally to reference to avoid hitting Stripe rate limits.
        break;
      case "customer.subscription.deleted":
        if (event.request != null) {
          // handle a subscription cancelled by your request
          // from above.
        } else {
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        break;
      case "customer.subscription.trial_will_end":
        // Send notification to your user that the trial will end
        break;
      default:
      // Unexpected event type
    }
    res.sendStatus(200);
  }
);

const port = 8004;

app.listen(port, () =>
  console.log(`Node server listening on port http://localhost:${port}!`)
);
