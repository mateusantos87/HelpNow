const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
admin.initializeApp();

// Define secrets
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: "europe-west3",
});

// Initialize Stripe (will be done inside functions with secret)
const getStripe = (secretKey) => {
  const stripe = require("stripe")(secretKey);
  return stripe;
};

/**
 * Create Payment Intent for a service request
 * Called from the mobile app when customer wants to pay
 */
exports.createPaymentIntent = onCall(
    {secrets: [stripeSecretKey]},
    async (request) => {
      try {
        const {serviceRequestId, amount, currency = "eur"} = request.data;
        const userId = request.auth?.uid;

        if (!userId) {
          throw new Error("User must be authenticated");
        }

        if (!serviceRequestId || !amount) {
          throw new Error("Missing required fields: serviceRequestId, amount");
        }

        // Get service request from Firestore
        const serviceRequestRef = admin.firestore()
            .collection("service_requests")
            .doc(serviceRequestId);

        const serviceRequestDoc = await serviceRequestRef.get();

        if (!serviceRequestDoc.exists) {
          throw new Error("Service request not found");
        }

        const serviceRequest = serviceRequestDoc.data();

        // Verify user is the client
        if (serviceRequest.clientId !== userId) {
          throw new Error("Unauthorized");
        }

        // Get professional's Stripe account
        const professionalRef = admin.firestore()
            .collection("professionals")
            .doc(serviceRequest.professionalId);

        const professionalDoc = await professionalRef.get();

        if (!professionalDoc.exists) {
          throw new Error("Professional not found");
        }

        const professional = professionalDoc.data();
        const stripeAccountId = professional.bankAccount?.stripeAccountId;

        if (!stripeAccountId) {
          throw new Error("Professional has not connected bank account");
        }

        // Calculate platform fee (15%)
        const platformFeePercent = 0.15;
        const platformFee = Math.round(amount * platformFeePercent);

        // Initialize Stripe
        const stripe = getStripe(stripeSecretKey.value());

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency,
          application_fee_amount: platformFee * 100,
          transfer_data: {
            destination: stripeAccountId,
          },
          metadata: {
            serviceRequestId: serviceRequestId,
            clientId: userId,
            professionalId: serviceRequest.professionalId,
          },
        });

        // Update service request with payment intent
        await serviceRequestRef.update({
          "payment.paymentIntentId": paymentIntent.id,
          "payment.status": "pending",
          "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("Payment Intent created", {
          paymentIntentId: paymentIntent.id,
          serviceRequestId: serviceRequestId,
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        logger.error("Error creating payment intent", error);
        throw new Error(`Payment creation failed: ${error.message}`);
      }
    });

/**
 * Stripe Webhook Handler
 * Receives events from Stripe (payment succeeded, failed, etc)
 */
exports.stripeWebhook = onRequest(
    {secrets: [stripeSecretKey]},
    async (req, res) => {
      const stripe = getStripe(stripeSecretKey.value());
      const sig = req.headers["stripe-signature"];

      // TODO: Set webhook secret after creating webhook in Stripe Dashboard
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        // Verify webhook signature
        if (webhookSecret) {
          event = stripe.webhooks.constructEvent(
              req.rawBody,
              sig,
              webhookSecret,
          );
        } else {
          // For testing without webhook secret
          event = req.body;
          logger.warn("Webhook secret not set - accepting unverified webhook");
        }
      } catch (err) {
        logger.error("Webhook signature verification failed", err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      try {
        switch (event.type) {
          case "payment_intent.succeeded":
            await handlePaymentSuccess(event.data.object);
            break;

          case "payment_intent.payment_failed":
            await handlePaymentFailure(event.data.object);
            break;

          case "charge.refunded":
            await handleRefund(event.data.object);
            break;

          case "account.updated":
            await handleAccountUpdated(event.data.object);
            break;

          default:
            logger.info(`Unhandled event type: ${event.type}`);
        }

        res.json({received: true});
      } catch (error) {
        logger.error("Error handling webhook", error);
        res.status(500).send("Webhook handler failed");
      }
    });

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  const {serviceRequestId, clientId, professionalId} = paymentIntent.metadata;

  logger.info("Payment succeeded", {
    paymentIntentId: paymentIntent.id,
    serviceRequestId: serviceRequestId,
  });

  // Update service request
  await admin.firestore()
      .collection("service_requests")
      .doc(serviceRequestId)
      .update({
        "payment.status": "paid",
        "payment.paidAt": admin.firestore.FieldValue.serverTimestamp(),
        "status": "paid",
        "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      });

  // Create payment record
  await admin.firestore().collection("payments").add({
    serviceRequestId: serviceRequestId,
    clientId: clientId,
    professionalId: professionalId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    stripePaymentIntentId: paymentIntent.id,
    status: "succeeded",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Send notification to client and professional
  logger.info("Payment recorded successfully");
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  const {serviceRequestId} = paymentIntent.metadata;

  logger.error("Payment failed", {
    paymentIntentId: paymentIntent.id,
    serviceRequestId: serviceRequestId,
  });

  await admin.firestore()
      .collection("service_requests")
      .doc(serviceRequestId)
      .update({
        "payment.status": "failed",
        "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
      });

  // TODO: Send notification to client
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
  logger.info("Refund processed", {chargeId: charge.id});
  // TODO: Update payment record and notify users
}

/**
 * Handle Stripe account updates
 */
async function handleAccountUpdated(account) {
  logger.info("Stripe account updated", {accountId: account.id});
  // TODO: Update professional's account status in Firestore
}

/**
 * Create Stripe Connect account for professional
 * Called when professional signs up
 */
exports.createConnectAccount = onCall(
    {secrets: [stripeSecretKey]},
    async (request) => {
      try {
        const {email, country = "IE"} = request.data;
        const userId = request.auth?.uid;

        if (!userId) {
          throw new Error("User must be authenticated");
        }

        const stripe = getStripe(stripeSecretKey.value());

        // Create Connect account
        const account = await stripe.accounts.create({
          type: "express",
          country: country,
          email: email,
          capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true},
          },
          business_type: "individual",
          metadata: {
            professionalId: userId,
          },
        });

        // Save account ID to Firestore
        await admin.firestore()
            .collection("professionals")
            .doc(userId)
            .update({
              "bankAccount.stripeAccountId": account.id,
              "bankAccount.isConnected": false,
              "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
            });

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: "https://helpnow.app/connect/refresh",
          return_url: "https://helpnow.app/connect/return",
          type: "account_onboarding",
        });

        logger.info("Connect account created", {
          accountId: account.id,
          professionalId: userId,
        });

        return {
          accountId: account.id,
          onboardingUrl: accountLink.url,
        };
      } catch (error) {
        logger.error("Error creating Connect account", error);
        throw new Error(`Account creation failed: ${error.message}`);
      }
    });
