export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "CourShare Payment Service API",
    version: "1.0.0",
    description: "API documentation for the CourShare Payment Service (Node.js, TypeScript, Express, Prisma)"
  },
  servers: [
    {
      url: "http://localhost:8083",
      description: "Local development server"
    }
  ],
  paths: {
    "/": {
      get: {
        tags: ["System"],
        summary: "Health Check",
        description: "Check the health status of the payment service.",
        responses: {
          200: {
            description: "Service is healthy and running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    service: {
                      type: "string",
                      example: "payment-service"
                    },
                    status: {
                      type: "string",
                      example: "UP"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/checkout/session": {
      post: {
        tags: ["Checkout"],
        summary: "Create Checkout Session",
        description: "Creates a checkout session for a course payment using a specified provider (e.g., Stripe).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "courseId", "amount", "provider"],
                properties: {
                  userId: {
                    type: "string",
                    example: "user_12345"
                  },
                  courseId: {
                    type: "string",
                    example: "course_67890"
                  },
                  amount: {
                    type: "number",
                    example: 49.99
                  },
                  currency: {
                    type: "string",
                    default: "usd",
                    example: "usd"
                  },
                  provider: {
                    type: "string",
                    enum: ["STRIPE", "PAYPAL", "MOMO", "VNPAY"],
                    example: "STRIPE"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Checkout session created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Stripe Checkout Session created"
                    },
                    StripeCheckoutSessionId: {
                      type: "string",
                      example: "cs_test_a1b2c3..."
                    },
                    StripeSessionUrl: {
                      type: "string",
                      example: "https://checkout.stripe.com/c/pay/cs_test_..."
                    }
                  }
                }
              }
            }
          },
          500: {
            description: "Server error or payment session creation failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Checkout session creation failed"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/checkout/verify": {
      get: {
        tags: ["Checkout"],
        summary: "Verify Checkout Status",
        description: "Retrieves the verification status of a checkout session using the Stripe Session ID.",
        parameters: [
          {
            name: "stripeSessionId",
            in: "query",
            required: true,
            schema: {
              type: "string"
            },
            description: "The unique ID of the Stripe checkout session.",
            example: "cs_test_a1b2c3..."
          }
        ],
        responses: {
          200: {
            description: "Payment status verified successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Payment status retrieved successfully"
                    },
                    status: {
                      type: "string",
                      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED", "EXPIRED"],
                      example: "SUCCESS"
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Payment not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Payment not found"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "Get Transactions by User ID",
        description: "Retrieves all transactions/payments associated with a specific user.",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: true,
            schema: {
              type: "string"
            },
            description: "The ID of the user whose transactions are to be fetched.",
            example: "user_12345"
          }
        ],
        responses: {
          200: {
            description: "Transactions retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Transactions retrieved successfully"
                    },
                    transactions: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Payment"
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: "Failed to retrieve transactions or user not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Get Transactions failed"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/transactions/{Id}/refund": {
      post: {
        tags: ["Transactions"],
        summary: "Refund Transaction",
        description: "Processes a refund for a specific transaction/Stripe session ID.",
        parameters: [
          {
            name: "Id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            },
            description: "The Stripe Session ID or payment ID to be refunded.",
            example: "cs_test_a1b2c3..."
          }
        ],
        responses: {
          200: {
            description: "Refund processed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Refund processed successfully"
                    },
                    refund: {
                      type: "object",
                      description: "Details of the updated payment and the Stripe refund object."
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Refund processing failed due to invalid request/state",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Refund failed"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/webhooks/stripe": {
      post: {
        tags: ["Webhooks"],
        summary: "Stripe Webhook Handler",
        description: "Receives events and notifications from Stripe (signature validation is performed using raw body parsing).",
        requestBody: {
          description: "Raw Stripe event payload",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Stripe event received and processed successfully"
          },
          400: {
            description: "Invalid payload or signature"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Payment: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "clxxxxxxx0000xxxxxxxxx"
          },
          userId: {
            type: "string",
            example: "user_12345"
          },
          courseId: {
            type: "string",
            example: "course_67890"
          },
          amount: {
            type: "string",
            example: "49.99"
          },
          currency: {
            type: "string",
            example: "usd"
          },
          status: {
            type: "string",
            enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED", "EXPIRED"],
            example: "SUCCESS"
          },
          provider: {
            type: "string",
            enum: ["STRIPE", "PAYPAL", "MOMO", "VNPAY"],
            example: "STRIPE"
          },
          stripeSessionId: {
            type: "string",
            nullable: true,
            example: "cs_test_a1b2c3..."
          },
          stripePaymentIntentId: {
            type: "string",
            nullable: true,
            example: "pi_123456..."
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-07-20T01:13:51.000Z"
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-07-20T01:14:00.000Z"
          }
        }
      }
    }
  }
};
