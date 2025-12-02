import type { IntegrationPlugin } from "../registry";
import { registerIntegration } from "../registry";
import { ShopifyIcon } from "./icon";

const shopifyPlugin: IntegrationPlugin = {
  type: "shopify",
  label: "Shopify",
  description: "Manage orders, products, and inventory in your Shopify store",

  icon: ShopifyIcon,

  formFields: [
    {
      id: "storeDomain",
      label: "Store Domain",
      type: "text",
      placeholder: "your-store.myshopify.com",
      configKey: "storeDomain",
      envVar: "SHOPIFY_STORE_DOMAIN",
      helpText: "Your Shopify store domain (e.g., your-store.myshopify.com)",
    },
    {
      id: "accessToken",
      label: "Admin API Access Token",
      type: "password",
      placeholder: "shpat_...",
      configKey: "accessToken",
      envVar: "SHOPIFY_ACCESS_TOKEN",
      helpText: "Create an access token from ",
      helpLink: {
        text: "Shopify Admin > Apps > Develop apps",
        url: "https://help.shopify.com/en/manual/apps/app-types/custom-apps",
      },
    },
  ],

  testConfig: {
    getTestFunction: async () => {
      const { testShopify } = await import("./test");
      return testShopify;
    },
  },

  actions: [
    {
      slug: "get-order",
      label: "Get Order",
      description: "Retrieve details of a specific order by ID",
      category: "Shopify",
      stepFunction: "getOrderStep",
      stepImportPath: "get-order",
      outputFields: [
        { field: "id", description: "Unique ID of the order" },
        { field: "orderNumber", description: "Human-readable order number" },
        { field: "name", description: "Order name (e.g., #1001)" },
        { field: "email", description: "Customer email address" },
        { field: "totalPrice", description: "Total price of the order" },
        { field: "currency", description: "Currency code (e.g., USD)" },
        {
          field: "financialStatus",
          description: "Payment status (pending, paid, refunded, etc.)",
        },
        {
          field: "fulfillmentStatus",
          description: "Fulfillment status (unfulfilled, fulfilled, partial)",
        },
        { field: "createdAt", description: "ISO timestamp when order was created" },
        { field: "lineItems", description: "Array of line item objects" },
        {
          field: "shippingAddress",
          description: "Shipping address object (if available)",
        },
        { field: "customer", description: "Customer information object" },
      ],
      configFields: [
        {
          key: "orderId",
          label: "Order ID",
          type: "template-input",
          placeholder: "450789469 or {{NodeName.orderId}}",
          example: "450789469",
          required: true,
        },
      ],
    },
    {
      slug: "list-orders",
      label: "List Orders",
      description: "Search and list orders with optional filters",
      category: "Shopify",
      stepFunction: "listOrdersStep",
      stepImportPath: "list-orders",
      outputFields: [
        { field: "orders", description: "Array of order objects" },
        { field: "count", description: "Number of orders returned" },
      ],
      configFields: [
        {
          key: "status",
          label: "Order Status",
          type: "select",
          defaultValue: "any",
          options: [
            { value: "any", label: "Any" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
        {
          key: "financialStatus",
          label: "Financial Status",
          type: "select",
          defaultValue: "",
          options: [
            { value: "", label: "Any" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "refunded", label: "Refunded" },
            { value: "voided", label: "Voided" },
            { value: "partially_refunded", label: "Partially Refunded" },
          ],
        },
        {
          key: "fulfillmentStatus",
          label: "Fulfillment Status",
          type: "select",
          defaultValue: "",
          options: [
            { value: "", label: "Any" },
            { value: "unfulfilled", label: "Unfulfilled" },
            { value: "fulfilled", label: "Fulfilled" },
            { value: "partial", label: "Partial" },
          ],
        },
        {
          key: "createdAtMin",
          label: "Created After (ISO date)",
          type: "template-input",
          placeholder: "2024-01-01 or {{NodeName.date}}",
        },
        {
          key: "createdAtMax",
          label: "Created Before (ISO date)",
          type: "template-input",
          placeholder: "2024-12-31 or {{NodeName.date}}",
        },
        {
          key: "limit",
          label: "Limit",
          type: "number",
          min: 1,
          defaultValue: "50",
        },
      ],
    },
    {
      slug: "create-product",
      label: "Create Product",
      description: "Create a new product in your Shopify store",
      category: "Shopify",
      stepFunction: "createProductStep",
      stepImportPath: "create-product",
      outputFields: [
        { field: "id", description: "Unique ID of the created product" },
        { field: "title", description: "Title of the product" },
        { field: "handle", description: "URL-friendly handle for the product" },
        { field: "status", description: "Product status (active, draft, archived)" },
        { field: "variants", description: "Array of product variants" },
        { field: "createdAt", description: "ISO timestamp when product was created" },
      ],
      configFields: [
        {
          key: "title",
          label: "Product Title",
          type: "template-input",
          placeholder: "Awesome T-Shirt or {{NodeName.title}}",
          example: "Awesome T-Shirt",
          required: true,
        },
        {
          key: "bodyHtml",
          label: "Description (HTML)",
          type: "template-textarea",
          placeholder: "<p>Product description...</p>",
          rows: 4,
          example: "<p>A comfortable cotton t-shirt</p>",
        },
        {
          key: "vendor",
          label: "Vendor",
          type: "template-input",
          placeholder: "Your Brand or {{NodeName.vendor}}",
          example: "Acme Inc",
        },
        {
          key: "productType",
          label: "Product Type",
          type: "template-input",
          placeholder: "T-Shirts or {{NodeName.type}}",
          example: "Clothing",
        },
        {
          key: "tags",
          label: "Tags (comma-separated)",
          type: "template-input",
          placeholder: "summer, sale, new",
          example: "summer, featured",
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          defaultValue: "draft",
          options: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
        },
        {
          key: "price",
          label: "Price",
          type: "template-input",
          placeholder: "29.99 or {{NodeName.price}}",
          example: "29.99",
        },
        {
          key: "sku",
          label: "SKU",
          type: "template-input",
          placeholder: "TSHIRT-001 or {{NodeName.sku}}",
          example: "TSHIRT-001",
        },
        {
          key: "inventoryQuantity",
          label: "Inventory Quantity",
          type: "number",
          min: 0,
          defaultValue: "0",
        },
      ],
    },
    {
      slug: "update-inventory",
      label: "Update Inventory",
      description: "Update inventory levels for a product variant",
      category: "Shopify",
      stepFunction: "updateInventoryStep",
      stepImportPath: "update-inventory",
      outputFields: [
        {
          field: "inventoryItemId",
          description: "ID of the inventory item updated",
        },
        { field: "locationId", description: "ID of the inventory location" },
        { field: "available", description: "New available inventory quantity" },
        { field: "previousQuantity", description: "Previous inventory quantity" },
      ],
      configFields: [
        {
          key: "inventoryItemId",
          label: "Inventory Item ID",
          type: "template-input",
          placeholder: "808950810 or {{NodeName.inventoryItemId}}",
          example: "808950810",
          required: true,
        },
        {
          key: "locationId",
          label: "Location ID",
          type: "template-input",
          placeholder: "655441491 or {{NodeName.locationId}}",
          example: "655441491",
          required: true,
        },
        {
          key: "adjustment",
          label: "Quantity Adjustment",
          type: "template-input",
          placeholder: "10 or -5 or {{NodeName.adjustment}}",
          example: "10",
          required: true,
        },
      ],
    },
  ],
};

registerIntegration(shopifyPlugin);

export default shopifyPlugin;
