import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    // Use 'sandbox' if you're using the Polar Sandbox environment
    // Remember that access tokens, products, etc. are completely separated between environments.
    // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
    server: 'sandbox'
});

export const auth = betterAuth({
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
    user: {
        deleteUser: {
            enabled: true,
            afterDelete: async (user, request) => {
                await polarClient.customers.deleteExternal({
                    externalId: user.id,
                });
            },
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "0c5bf16b-386d-402a-bec5-298b0a945f8f", // ID of Product from Polar Dashboard
                            slug: "pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
                        }
                    ],
                    successUrl: "/dashboard",
                    authenticatedUsersOnly: true
                }),
                portal(),
                usage(),
                // webhooks({ 
                //     secret: process.env.POLAR_WEBHOOK_SECRET, 
                //     onCustomerStateChanged: (payload) => {}, // Triggered when anything regarding a customer changes
                //     onOrderPaid: (payload) => {},
                // }) 
            ],
        })
    ]
})