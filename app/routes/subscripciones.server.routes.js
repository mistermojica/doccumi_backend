const { get } = require("lodash");
var subscripciones = require("../controllers/subscripciones.server.controller");

module.exports = function (app) {
  app.route("/subscripciones/load-stripe-init").post(subscripciones.load_stripe_init);

  app.route("/subscripciones/create-customer").post(subscripciones.create_customer);
  app.route("/subscripciones/load-customer").post(subscripciones.load_customer);

  app.route("/subscripciones/payment-response").get(subscripciones.payment_response);
  app.route("/subscripciones/create-payment-intent").post(subscripciones.create_payment_intent);

  app.route("/subscripciones/prices").post(subscripciones.prices);

  app.route("/subscripciones/subscriptions").post(subscripciones.subscriptions);
  app.route("/subscripciones/subscriptions-by-status").post(subscripciones.subscriptionsByStatus);
  app.route("/subscripciones/create-subscription").post(subscripciones.create_subscription);
  app.route("/subscripciones/update-subscription").post(subscripciones.update_subscription);
  app.route("/subscripciones/cancel-subscription").post(subscripciones.cancel_subscription);
  // app.route("/subscripciones/confirm-subscription").post(subscripciones.confirm_subscription);

  app.route("/subscripciones/create-payment-method").post(subscripciones.create_payment_method);
  app.route("/subscripciones/list-payment-methods").post(subscripciones.list_payment_methods);
  app.route("/subscripciones/get-default-payment-method").post(subscripciones.get_default_payment_method);
  
  app.route("/subscripciones/set-default-payment-method").post(subscripciones.set_default_payment_method);
  app.route("/subscripciones/delete-payment-method").post(subscripciones.delete_payment_method);

  app.route("/subscripciones/invoice-preview").post(subscripciones.invoice_preview);

  app.route("/subscripciones/webhook").post(subscripciones.webhook);
};
