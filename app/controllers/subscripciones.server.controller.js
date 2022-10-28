// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.

const express = require("express");
const app = express();
const { resolve } = require("path");
const bodyParser = require("body-parser");
const url = require("node:url");
const querystring = require("node:querystring");
const os = require("os");

const entities = new Map();

const hostname = os.hostname();

const STRIPE_SECRET_KEY = hostname.indexOf("local") > -1 ? process.env.DEV_STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = hostname.indexOf("local") > -1 ? process.env.DEV_STRIPE_PUBLISHABLE_KEY : process.env.STRIPE_PUBLISHABLE_KEY;
const STATIC_DIR = process.env.STATIC_DIR;

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

// Use JSON parser for parsing payloads as JSON on all non-webhook routes.
// app.use((req, res, next) => {
//   if (req.originalUrl === "/webhook") {
//     next();
//   } else {
//     bodyParser.json()(req, res, next);
//   }
// });

// console.log("create() || req.body:", req.body);

// var entity = new db.Configuraciones(req.body);
// entity.save(function (err) {
//   if (err) {
//     console.log(__filename + " >> .create: " + JSON.stringify(err));
//     res.json({
//       status: "FAILED",
//       message: `Error en la creación del ${entityName}.`,
//       data: err,
//     });
//   } else {
//     res.json({
//       status: "SUCCESS",
//       message: `${entityName} creado exitosamente.`,
//       data: entity,
//     });
//   }
// });

exports.payment_response = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const myUrl = url.parse(req.originalUrl);
  res.send(querystring.parse(myUrl.query));
};

exports.create_payment_intent = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const { items } = req.body;
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
};

exports.prices = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  const customerId = req.body.customerId;

  const prices = await stripe.prices.list({
    // lookup_keys: ['sample_basic', 'sample_premium'],
    expand: ["data.product"],
    active: true,
    limit: 3,
  });

  entities.set("prices", prices);

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });

  const result = {
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    prices: prices.data,
    currentPrice: subscriptions?.data[0]?.items?.data[0]?.price
  };

  console.log('currentPrice:', subscriptions?.data);

  res.send(result);
};

exports.create_customer = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

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
};

exports.create_payment_method = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    // const paymentMethod = await stripe.paymentMethods.create({
    //     type: "card",
    //     card: {
    //       number: req.body.cardNumber,
    //       exp_month: req.body.cardMonth,
    //       exp_year: req.body.cardYear,
    //       cvc: req.body.cardCVC,
    //     },
    // });

    console.log("body:", req.body);

    const attachPaymentToCustomer = await stripe.paymentMethods.attach(
      req.body.paymentMethodId,
      {
        customer: req.body.customerId,
      }
    );

    console.log({ attachPaymentToCustomer });

    if (req.body?.makeDefault === true) {
      const updateCustomerDefaultPaymentMethod = await stripe.customers.update(
        req.body.customerId,
        {
          invoice_settings: {
            default_payment_method: req.body.paymentMethodId,
          },
        }
      );

      console.log({ updateCustomerDefaultPaymentMethod });
    }

    res.send({
      status: true,
      message: "Método de pago creado exitosamente.",
      result: attachPaymentToCustomer,
    });
  } catch (error) {
    res.send({
      status: false,
      message:
        "Error inesperado al crear método de pago, por favor trqte de nuevo.",
      result: error,
    });
  }
};

exports.create_subscription = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Simulate authenticated user. In practice this will be the
  // Stripe Customer ID related to the authenticated user.
  // const customerId = req.cookies['customer'];

  const customerId = req.body.customerId; //entities.get("customerId");
  const priceId = req.body.priceId;

  // const subscriptions = await stripe.subscriptions.list({
  //   customer: customerId,
  //   status: "active",
  // });

  const customer = await stripe.customers.retrieve(customerId, {});

  const paymentMethodId = customer.invoice_settings.default_payment_method;
  if (!paymentMethodId) {
    res.send({
      status: false,
      message: "Este cliente no tiene un método de pago predeterminado.",
      result: {},
    });
  }

  // if (subscriptions.data.length > 0) {

  // } else {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_behavior: "default_incomplete",
      // collection_method: "charge_automatically",
      expand: ["latest_invoice.payment_intent"],
    });

    console.log("create - subscription:", { subscription });

    res.send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      items: subscription.items.data,
      subscription: subscription,
    });
  } catch (error) {
    console.log({ error });
    return res
      .status(400)
      .send({ code: "222", error: { message: error.message } });
  }
  // }
};

exports.update_subscription = async function (req, res, next) {
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
    const subscriptionCreated = req.body.subscriptionCreated;

    const customer = await stripe.customers.retrieve(customerId, {});
    const paymentMethodId = customer.invoice_settings.default_payment_method;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method", "latest_invoice.payment_intent"],
    });

    // console.log('update-subscription:', {subscription});

    // const paymentIntentId = subscription.latest_invoice.payment_intent.id;

    // const paymentIntent = await stripe.paymentIntents.confirm(
    //   paymentIntentId,
    //   { payment_method: paymentMethodId }
    // );

    let ctxSubscription = {};
    
    if (subscriptionCreated) {
      ctxSubscription.cancel_at_period_end = false;
      ctxSubscription.expand = ["latest_invoice.payment_intent"];
      ctxSubscription.payment_settings = {
          payment_method_types: ["card"]
      };
      ctxSubscription.items = [
        {
          id: subscription.items.data[0].id,
          price: priceId,
          quantity: 1
        }
      ];
      ctxSubscription.default_payment_method = paymentMethodId;
    } else {
      ctxSubscription.cancel_at_period_end = false;
      ctxSubscription.billing_cycle_anchor = 'now';
      ctxSubscription.proration_behavior = "create_prorations";
      ctxSubscription.expand = ["latest_invoice.payment_intent"];
      // txSubscription.collection_method: "charge_automatically",
      ctxSubscription.payment_settings = {
          payment_method_types: ["card"]
      };
      ctxSubscription.items = [
        {
          id: subscription.items.data[0].id,
          price: priceId,
          quantity: 1
        }
      ];
      ctxSubscription.default_payment_method = paymentMethodId;
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      ctxSubscription
    );

    // console.log({updatedSubscription});

    // console.log('subscription.latest_invoice.payment_intent:', subscription.latest_invoice.payment_intent);
    // console.log('subscription.latest_invoice.billing_reason:', subscription.latest_invoice.billing_reason);
    // console.log('paymentMethodId 111:', paymentMethodId);

    if (subscriptionCreated && subscription.latest_invoice.billing_reason == "subscription_create") {
      // The subscription automatically activates after successful payment
      // Set the payment method used to pay the first invoice
      // as the default payment method for that subscription

      // Retrieve the payment intent used to pay the subscription
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   paymentIntentId
      // );

      const paymentIntentId = subscription.latest_invoice.payment_intent.id;

      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        { payment_method: paymentMethodId }
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

    console.log('update-subscription:', {subscriptionN});

    // console.log("update - updatedSubscription:", {updatedSubscription});

    // console.log("updatedSubscription.latest_invoice.payment_intent:", {
    //   subscriptionId: subscriptionId,
    //   clientSecret:
    //     updatedSubscription.latest_invoice.payment_intent.client_secret,
    //   message: "Subscripción modificada.",
    // });

    console.log('payment_intent:', subscriptionN?.latest_invoice?.payment_intent);

    res.send({
      succeed: true,
      subscriptionId: subscriptionId,
      // clientSecret:
      //   subscriptionN?.latest_invoice?.payment_intent?.client_secret,
      code: "",
      message: "Subscripción modificada exitosamente.",
    });
  } catch (error) {
    console.log({error});
    console.log(error.message);
    // console.log({
    //   succeed: false,
    //   code: error?.decline_code || error?.code,
    //   message: online_payment_error_codes[error?.decline_code || error?.code]
    // });
    return res
      .status(400)
      .send({
        succeed: false,
        code: error.decline_code,
        message: online_payment_error_codes[error?.decline_code || error?.code],
        result: error
      });
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
};

exports.list_payment_methods = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // List payment methods
  try {
    const customerId = req.body.customerId;

    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      { type: "card" }
    );

    res.send({ cards: paymentMethods.data });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.get_default_payment_method = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // List payment methods
  try {
    const customerId = req.body.customerId;

    const customer = await stripe.customers.retrieve(customerId, {});

    const paymentMethodId = customer.invoice_settings.default_payment_method;

    res.send({defaultPaymentMethodId: paymentMethodId});
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.set_default_payment_method = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // console.log('set-default-payment-method:', req.body);

  const customerId = req.body.customerId;
  const paymentMethodId = req.body.paymentMethodId;

  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      metadata: {
        order_id: "DOCCUMI-0000001",
      },
    });

    // console.log({customer});

    res.send({ customerUpdated: customer });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.delete_payment_method = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // console.log('delete-payment-method:', req.body);

  // List payment methods
  try {
    const paymentId = req.body.paymentMethodId;
    const paymentMethod = await stripe.paymentMethods.detach(paymentId);

    // console.log({paymentMethod});

    res.send({ paymentMethod: paymentMethod });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.load_customer = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const customerId = req.body.customerId;
    const customer = await stripe.customers.retrieve(customerId, {
      // expand: ["default_payment_method"]
    });

    res.send({ customer: customer });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.load_stripe_init = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  try {
    const customerId = req.body.customerId;
    const customer = await stripe.customers.retrieve(customerId, {
      // expand: ["default_payment_method"]
    });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      expand: [
        "data.default_payment_method",
        "data.plan.product",
        "data.latest_invoice",
      ],
      limit: 10
    });

    res.send({ customer, subscriptions });
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
};

exports.invoice_preview = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const customerId = req.body.customerId;
  const priceId = req.body.priceId;
  const subscriptionId = req.body.subscriptionId;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const invoice = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: subscriptionId,
    subscription_items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });

  res.send({ invoice });
};

exports.cancel_subscription = async function (req, res, next) {
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
};

exports.subscriptions = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const customerId = req.body.customerId;

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    expand: [
      "data.default_payment_method",
      "data.plan.product",
      "data.latest_invoice",
    ],
    limit: 10
  });

  res.json({ subscriptions });
};

exports.subscriptionsByStatus = async function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  const customerId = req.body.customerId;
  const statusCode = req.body.statusCode;

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: statusCode,
    expand: [
      "data.default_payment_method",
      "data.plan.product",
      "data.latest_invoice",
    ],
    limit: 100
  });

  res.json({ subscriptions });
};

exports.webhook = async function (req, res, next) {
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
    console.log(`⚠️  Check the env file and enter the correct webhook secret.`);
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
};

const compareStatus = (a, b) => {
  if (a.status < b.status) {
    return -1;
  }
  if (a.status > b.status) {
    return 1;
  }
  return 0;
};

const online_payment_error_codes = {
  authentication_required: "La tarjeta se rechazó porque la transacción requiere autenticación.",
  approve_with_id: "No se puede autorizar el pago.",
  call_issuer: "La tarjeta se ha rechazado por un motivo desconocido.",
  card_not_supported: "La tarjeta no acepta este tipo de compras.",
  card_velocity_exceeded: "El cliente ha excedido el límite del saldo o del crédito disponible en su tarjeta.",
  currency_not_supported: "La tarjeta no acepta la divisa especificada.",
  do_not_honor: "La tarjeta se ha rechazado por un motivo desconocido.",
  do_not_try_again: "La tarjeta se ha rechazado por un motivo desconocido.",
  duplicate_transaction: "Hace muy poco se realizó otra transacción por el mismo importe con una tarjeta de crédito con los mismos datos.",
  expired_card: "La tarjeta ha caducado.",
  fraudulent: "El pago se ha rechazado porque Stripe sospecha que es fraudulento.",
  generic_decline: "La tarjeta fue rechazada por un motivo desconocido o posiblemente provocada por una regla de pago bloqueada.",
  incorrect_number: "El número de tarjeta no es correcto.",
  incorrect_cvc: "El número de CVC no es correcto.",
  incorrect_pin: "El PIN introducido es incorrecto. Este código de rechazo solo se aplica a los pagos efectuados con un lector de tarjetas.",
  incorrect_zip: "El código postal no es correcto.",
  insufficient_funds: "La tarjeta no tiene fondos suficientes para hacer la compra.",
  invalid_account: "La tarjeta o la cuenta a la que está conectada la tarjeta no es válida.",
  invalid_amount: "El importe del pago no es válido o excede el importe permitido.",
  invalid_cvc: "El número de CVC no es correcto.",
  invalid_expiry_month: "El mes de caducidad no es válido.",
  invalid_expiry_year: "El año de caducidad no es válido.",
  invalid_number: "El número de tarjeta no es correcto.",
  invalid_pin: "El PIN introducido es incorrecto. Este código de rechazo solo se aplica a los pagos efectuados con un lector de tarjetas.",
  issuer_not_available: "No se ha podido establecer contacto con el emisor de la tarjeta, así que no se ha podido autorizar el pago.",
  lost_card: "El pago se ha rechazado porque la tarjeta figura como tarjeta perdida.",
  merchant_blacklist: "El pago se ha rechazado porque coincide con un valor de la lista de bloqueo del usuario de Stripe.",
  new_account_information_available: "La tarjeta o la cuenta a la que está conectada la tarjeta no es válida.",
  no_action_taken: "La tarjeta se ha rechazado por un motivo desconocido.",
  not_permitted: "El pago no está permitido.",
  offline_pin_required: "La tarjeta se ha rechazado porque hace falta un PIN.",
  online_or_offline_pin_required: "La tarjeta se ha rechazado porque hace falta un PIN.",
  pickup_card: "El cliente no puede usar esta tarjeta para efectuar este pago. (Es posible que haya sido denunciada por pérdida o robo).",
  pin_try_exceeded: "Se ha superado el número permitido de intentos de introducción del PIN.",
  processing_error: "Ha ocurrido un error mientras se procesaba la tarjeta.",
  reenter_transaction: "El emisor no ha podido procesar el pago por un motivo desconocido.",
  restricted_card: "El cliente no puede usar esta tarjeta para efectuar este pago. (Es posible que haya sido denunciada por pérdida o robo).",
  revocation_of_all_authorizations: "La tarjeta se ha rechazado por un motivo desconocido.",
  revocation_of_authorization: "La tarjeta se ha rechazado por un motivo desconocido.",
  security_violation: "La tarjeta se ha rechazado por un motivo desconocido.",
  service_not_allowed: "La tarjeta se ha rechazado por un motivo desconocido.",
  stolen_card: "El pago se ha rechazado porque la tarjeta figura como robada.",
  stop_payment_order: "La tarjeta se ha rechazado por un motivo desconocido.",
  testmode_decline: "Se utilizó el número de una tarjeta de prueba de Stripe.",
  transaction_not_allowed: "La tarjeta se ha rechazado por un motivo desconocido.",
  try_again_later: "La tarjeta se ha rechazado por un motivo desconocido.",
  withdrawal_count_limit_exceeded: "El cliente ha excedido el límite del saldo o del crédito disponible en su tarjeta.",
  card_decline_rate_limit_exceeded: "Ha excedido el número máximo de rechazos en esta tarjeta en el último período de 24 horas.",
  payment_intent_unexpected_state: "Ha ocurrido un error inesperado al procesar el pago, por favor trate de nuevo." //You cannot confirm this PaymentIntent because it has already succeeded after being previously confirmed.
}