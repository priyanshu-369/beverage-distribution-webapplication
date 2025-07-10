// --- I. Core User & Account Management ---

// 1. User Model (Users Collection)
// Purpose: Stores all user accounts, whether they are customers, drivers, or administrative staff.
// This is the central identity for anyone interacting with the system.
const UserSchema = {
  _id: { type: 'ObjectId', auto: true }, // MongoDB auto-generated unique identifier for the user.
  email: { type: String, required: true, unique: true }, // User's primary email address, used for login and notifications.
  phoneNumber: { type: String, required: true, unique: true }, // User's primary phone number, used for login, OTP, and SMS notifications.
  passwordHash: { type: String, required: true }, // Hashed and salted password for secure authentication. Managed by the authentication service.
  firstName: { type: String, required: true }, // User's first name.
  lastName: { type: String, required: true }, // User's last name.
  role: {
    type: String,
    enum: ['customer', 'driver', 'admin', 'super_admin'],
    default: 'customer',
    required: true,
  }, // Defines the user's role in the system, crucial for Role-Based Access Control (RBAC).
  isActive: { type: Boolean, default: true }, // Indicates if the user account is currently active and can log in.
  isEmailVerified: { type: Boolean, default: false }, // Status of email verification (e.g., via OTP or link).
  isPhoneVerified: { type: Boolean, default: false }, // Status of phone number verification (e.g., via OTP).
  registrationTimestamp: { type: Date, default: Date.now }, // Timestamp when the user account was created.
  lastLoginTimestamp: { type: Date }, // Timestamp of the user's last successful login. Useful for activity tracking.
  lastActivityTimestamp: { type: Date }, // Timestamp of the user's last significant activity (e.g., order, profile update). Useful for engagement metrics.
  // Indexes: email (unique), phoneNumber (unique), role, isActive
};

// 2. Address Model (Addresses Collection)
// Purpose: Stores specific delivery or billing addresses associated with users.
const AddressSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the address.
  userId: { type: 'ObjectId', ref: 'User', required: true }, // Reference to the User who owns this address.
  addressType: { type: String, enum: ['Home', 'Office', 'Other', 'Billing'], required: true }, // Categorization of the address (e.g., for customer convenience).
  label: { type: String }, // A user-friendly label for the address (e.g., "My Apartment", "Work Office").
  streetAddressLine1: { type: String, required: true }, // Primary street address line.
  streetAddressLine2: { type: String }, // Secondary address line, e.g., apartment number, floor.
  landmark: { type: String }, // Nearby recognizable landmark for easier delivery.
  city: { type: String, required: true }, // City of the address.
  state: { type: String, required: true }, // State/Province of the address.
  postalCode: { type: String, required: true }, // Postal code (ZIP code) of the address. CRITICAL for zone identification and serviceability checks.
  country: { type: String, required: true }, // Country of the address.
  latitude: { type: Number }, // Geographical latitude of the address. Optional, but highly recommended for mapping, route optimization, and precise zone matching.
  longitude: { type: Number }, // Geographical longitude of the address. Optional, but highly recommended for mapping, route optimization, and precise zone matching.
  isDefault: { type: Boolean, default: false }, // Indicates if this is the user's default delivery address.
  // Indexes: userId, postalCode, { latitude, longitude } (for geospatial queries if used)
};

// 3. Staff Model (Staff Collection)
// Purpose: Stores additional details for users who have an administrative or operational staff role.
const StaffSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the staff record.
  userId: { type: 'ObjectId', ref: 'User', required: true, unique: true }, // Reference to the associated User account (where login credentials and basic info are stored).
  staffId: { type: String, required: true, unique: true }, // A unique identifier for internal staff management (e.g., employee ID).
  department: { type: String, enum: ['Operations', 'Inventory', 'Finance', 'Admin', 'Customer Support'] }, // The department the staff member belongs to.
  permissions: { type: [String], default: [] }, // An array of specific permissions (e.g., ["manage_products", "view_all_orders", "assign_drivers"]). Used for fine-grained authorization beyond just the role.
  hireDate: { type: Date, default: Date.now }, // Date when the staff member was hired.
  isManager: { type: Boolean, default: false }, // Indicates if the staff member has managerial responsibilities.
  isActive: { type: Boolean, default: true }, // Indicates if the staff member is currently active and authorized to perform staff duties.
  // Indexes: userId (unique), staffId (unique), department, isActive
};

// --- II. Product & Inventory Management ---

// 1. Product Model (Products Collection) - GENERIC
// Purpose: Defines all available products, including beverages and machines.
const ProductSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the product.
  name: { type: String, required: true, unique: true }, // Name of the product (e.g., "Bisleri 20L Can", "Aquaguard Water Dispenser").
  description: { type: String }, // Detailed description of the product.
  sku: { type: String, unique: true }, // Stock Keeping Unit, a unique identifier for inventory.
  barcode: { type: String, unique: true, sparse: true }, // Optional: Barcode for quick scanning in inventory or delivery.
  basePrice: { type: Number, required: true, min: 0 }, // The base price of the product before any discounts or taxes.
  category: { type: String, enum: ['Beverage', 'Machine', 'Accessory', 'Service'], required: true }, // Broad categorization of the product (e.g., water, dispenser, filter, installation).
  subCategory: { type: String }, // More specific categorization (e.g., "Water Bottle", "Water Can", "Water Dispenser", "Water Filter", "Installation Service").
  brand: { type: String }, // Brand name of the product.
  // Attributes specific to Beverages
  volume: { type: Number }, // Volume of the beverage (e.g., 20 for 20L can, 1 for 1L bottle).
  volumeUnit: { type: String, enum: ['L', 'ml', 'Gallon'] }, // Unit of volume (e.g., Liters, milliliters).
  packagingType: { type: String, enum: ['Plastic Bottle', 'Reusable Can', 'Glass Bottle', 'Carton', 'Jar'] }, // Type of packaging for beverages.
  // Attributes specific to Machines/Accessories
  powerConsumption: { type: String }, // For machines: e.g., "220V", "100W".
  capacity: { type: String }, // For machines: e.g., "5L Tank", "10L/hr filtration".
  machineCompatibility: { type: [String] }, // For consumable products (like filters) or refills: lists compatible machine models/types (e.g., ["AquaPure XL", "HydroFlow Pro"]).
  // Common attributes
  imageUrl: { type: String }, // URL to the product image.
  currentStockLevel: { type: Number, default: 0, min: 0 }, // Current quantity of the product in inventory.
  minStockThreshold: { type: Number, default: 0 }, // Minimum stock level before an alert is triggered.
  isActive: { type: Boolean, default: true }, // Indicates if the product is visible and available for ordering.
  createdAt: { type: Date, default: Date.now }, // Timestamp when the product record was created.
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last update to the product record.
  // Indexes: name, category, subCategory, isActive, sku
};

// 2. Inventory Log Model (InventoryLogs Collection)
// Purpose: Records all changes to product stock levels for auditing and analysis.
const InventoryLogSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the inventory log entry.
  productId: { type: 'ObjectId', ref: 'Product', required: true }, // Reference to the Product whose stock level changed.
  changeType: { type: String, enum: ['Inbound', 'Outbound', 'Adjustment', 'Return'], required: true }, // Type of stock change (e.g., received, sold, corrected).
  quantityChange: { type: Number, required: true }, // The quantity by which stock changed (positive for increase, negative for decrease).
  newStockLevel: { type: Number, required: true, min: 0 }, // The stock level after this change was applied.
  timestamp: { type: Date, default: Date.now }, // Timestamp when the stock change occurred.
  reason: { type: String }, // Brief description of why the stock changed (e.g., "New shipment", "Customer order #123").
  staffUserId: { type: 'ObjectId', ref: 'User' }, // Optional: Reference to the Staff User who initiated this inventory change (e.g., for manual adjustments).
  orderId: { type: 'ObjectId', ref: 'Order' }, // Optional: Reference to the Order if this change was due to an order fulfillment.
  // Indexes: productId, timestamp, changeType
};

// --- III. Ordering & Subscriptions ---

// 1. Order Model (Orders Collection)
// Purpose: Represents a single, one-time delivery request from a customer.
const OrderSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the order.
  customerId: { type: 'ObjectId', ref: 'User', required: true }, // Reference to the Customer (User) who placed the order.
  deliveryAddressId: { type: 'ObjectId', ref: 'Address', required: true }, // Reference to the Address where the order needs to be delivered.
  orderTimestamp: { type: Date, default: Date.now }, // Timestamp when the order was placed by the customer.
  scheduledDeliveryDate: { type: Date, required: true }, // The date requested by the customer for delivery.
  scheduledTimeSlot: { type: String, required: true }, // The specific time window requested for delivery (e.g., "9AM-12PM", "2PM-5PM").
  totalAmount: { type: Number, required: true, min: 0 }, // The final total amount of the order after all calculations (items, delivery fee, discounts, taxes).
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' }, // Current status of the payment for this order.
  paymentMethod: { type: String, enum: ['Credit Card', 'UPI', 'Net Banking', 'COD'], required: true }, // Method chosen by the customer for payment.
  orderStatus: {
    type: String,
    enum: ['Pending Assignment', 'Assigned', 'Picked Up', 'On the Way', 'Delivered', 'Delivery Attempt Failed', 'Cancelled', 'Refunded'],
    default: 'Pending Assignment',
    required: true,
  }, // Current operational status of the order.
  assignedDriverId: { type: 'ObjectId', ref: 'DeliveryDriver' }, // Optional: Reference to the DeliveryDriver assigned to this order. Nullable until assigned.
  actualDeliveryTimestamp: { type: Date }, // Optional: Timestamp when the delivery was actually completed.
  invoiceUrl: { type: String }, // Optional: URL to the generated invoice for this order.
  identifiedDeliveryZoneId: { type: 'ObjectId', ref: 'Zone' }, // Reference to the Zone identified for this delivery address's postal code.
  promotionCodeApplied: { type: String, ref: 'Promotion' }, // Optional: The code of the promotion applied to this order.
  customerNotes: { type: String }, // Optional: Any specific notes or instructions from the customer for this order.
  adminNotes: { type: String }, // Optional: Internal notes added by admin/staff regarding the order.
  // Indexes: customerId, orderStatus, scheduledDeliveryDate, assignedDriverId, identifiedDeliveryZoneId, orderTimestamp
};

// 2. Order Item Model (OrderItems Collection)
// Purpose: Details the specific products and quantities included in a given order.
const OrderItemSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the order item.
  orderId: { type: 'ObjectId', ref: 'Order', required: true }, // Reference to the Order this item belongs to.
  productId: { type: 'ObjectId', ref: 'Product', required: true }, // Reference to the Product ordered.
  quantity: { type: Number, required: true, min: 1 }, // Quantity of the product ordered.
  unitPriceAtOrder: { type: Number, required: true, min: 0 }, // The price of the product at the exact time the order was placed (for historical accuracy, in case product prices change later).
  subtotal: { type: Number, required: true, min: 0 }, // Subtotal for this item (quantity * unitPriceAtOrder).
  // Indexes: orderId, productId
};

// 3. Subscription Model (Subscriptions Collection)
// Purpose: Manages recurring water deliveries for customers.
const SubscriptionSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the subscription.
  customerId: { type: 'ObjectId', ref: 'User', required: true }, // Reference to the Customer (User) who owns this subscription.
  deliveryAddressId: { type: 'ObjectId', ref: 'Address', required: true }, // Reference to the Address for recurring deliveries.
  startDate: { type: Date, required: true }, // The date when the subscription officially begins.
  endDate: { type: Date }, // Optional: The date when the subscription is scheduled to end (for finite plans).
  frequencyType: { type: String, enum: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'], required: true }, // How often deliveries occur (e.g., "Weekly").
  frequencyValue: { type: Number, required: true, min: 1 }, // The numerical value for frequency (e.g., 1 for "Daily", 2 for "Bi-Weekly").
  deliveryDayOfWeek: { type: [String], enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }, // Array of specific days of the week for delivery (e.g., ["Monday", "Wednesday", "Friday"]).
  preferredTimeSlot: { type: String, required: true }, // The preferred time window for recurring deliveries.
  status: { type: String, enum: ['Active', 'Paused', 'Cancelled', 'Completed'], default: 'Active', required: true }, // Current status of the subscription.
  nextDeliveryDate: { type: Date }, // The system-calculated date for the next upcoming delivery.
  paymentFrequency: { type: String, enum: ['Per Delivery', 'Monthly', 'Quarterly', 'Annually'], default: 'Per Delivery' }, // How often the customer is billed for this subscription.
  totalPrepaidAmount: { type: Number, min: 0 }, // Optional: If the subscription is pre-paid for a period, this stores the total prepaid amount.
  promotionCodeApplied: { type: String, ref: 'Promotion' }, // Optional: The code of the promotion applied to this subscription.
  createdAt: { type: Date, default: Date.now }, // Timestamp when the subscription was created.
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last update to the subscription record.
  // Indexes: customerId, status, nextDeliveryDate
};

// 4. Subscription Item Model (SubscriptionItems Collection)
// Purpose: Details the products included in a specific subscription.
const SubscriptionItemSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the subscription item.
  subscriptionId: { type: 'ObjectId', ref: 'Subscription', required: true }, // Reference to the Subscription this item belongs to.
  productId: { type: 'ObjectId', ref: 'Product', required: true }, // Reference to the Product included in the subscription.
  quantity: { type: Number, required: true, min: 1 }, // Quantity of the product for each recurring delivery.
  unitPriceAtSubscription: { type: Number, required: true, min: 0 }, // The price of the product at the time the subscription was created.
  subtotal: { type: Number, required: true, min: 0 }, // Subtotal for this item per delivery (quantity * unitPriceAtSubscription).
  // Indexes: subscriptionId, productId
};

// --- IV. Operations & Logistics ---

// 1. Delivery Driver Model (DeliveryDrivers Collection)
// Purpose: Stores specific details for users who act as delivery drivers.
const DeliveryDriverSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the driver record.
  userId: { type: 'ObjectId', ref: 'User', required: true, unique: true }, // Reference to the associated User account (where login credentials and basic info are).
  licenseNumber: { type: String, required: true, unique: true }, // Driver's license number for verification.
  vehicleDetails: { type: String }, // Description of the driver's vehicle (e.g., "Bike - MH01AB1234", "Van - KA51XY5678").
  basePostalCode: { type: String, required: true }, // The primary postal code where the driver is based or operates from.
  operationalZoneIds: { type: ['ObjectId'], ref: 'Zone' }, // Array of references to Zones where this driver is authorized/assigned to deliver.
  currentStatus: { type: String, enum: ['Available', 'On Duty', 'Off Duty', 'Break', 'Busy'], default: 'Off Duty' }, // Current operational status of the driver.
  currentLatitude: { type: Number }, // Optional: Real-time geographical latitude of the driver for tracking.
  currentLongitude: { type: Number }, // Optional: Real-time geographical longitude of the driver for tracking.
  lastLocationUpdate: { type: Date }, // Timestamp of the last known location update.
  performanceRating: { type: Number, min: 1.0, max: 5.0 }, // Average rating received by the driver from customers.
  driverRatingCount: { type: Number, default: 0 }, // Number of ratings received by the driver.
  totalDeliveriesCompleted: { type: Number, default: 0 }, // Total number of deliveries successfully completed by the driver.
  lastDeliveryCompletedTimestamp: { type: Date }, // Timestamp of the last completed delivery. Useful for driver assignment logic.
  isActive: { type: Boolean, default: true }, // Indicates if the driver account is active and can be assigned deliveries.
  // Indexes: userId (unique), basePostalCode, operationalZoneIds (for array elements), currentStatus
};

// 2. Zone Model (Zones Collection)
// Purpose: Defines geographical delivery areas for order assignment and driver management.
const ZoneSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the zone.
  zoneName: { type: String, required: true, unique: true }, // Human-readable name of the delivery zone (e.g., "South Mumbai", "Andheri East").
  description: { type: String }, // Optional: Detailed description of the area covered by the zone.
  includedPostalCodes: { type: [String], required: true }, // An array of postal codes that fall within this zone. This is the primary method for defining zones based on addresses.
  polygonCoordinates: { type: [[Number]] }, // Optional: Array of [longitude, latitude] pairs defining a GeoJSON Polygon for more precise, complex zone boundaries. (e.g., [[lon1, lat1], [lon2, lat2], ...]).
  isActive: { type: Boolean, default: true }, // Indicates if the zone is currently active for deliveries.
  // Indexes: zoneName, includedPostalCodes (for array elements, for efficient lookup)
};

// 3. Delivery Proof Model (DeliveryProofs Collection)
// Purpose: Records evidence of successful deliveries, typically captured by the driver.
const DeliveryProofSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the delivery proof record.
  orderId: { type: 'ObjectId', ref: 'Order', required: true }, // Reference to the Order this proof is for.
  driverId: { type: 'ObjectId', ref: 'DeliveryDriver', required: true }, // Reference to the DeliveryDriver who captured this proof.
  type: { type: String, enum: ['Photo', 'Signature'], required: true }, // Type of proof captured (e.g., photo of package at door, digital signature).
  fileUrl: { type: String, required: true }, // URL to the stored proof file (image of photo/signature).
  timestamp: { type: Date, default: Date.now }, // Timestamp when the proof was captured.
  notes: { type: String }, // Optional: Any additional notes from the driver regarding the delivery proof.
  // Indexes: orderId, driverId
};

// --- V. Financial & Marketing ---

// 1. Payment Transaction Model (PaymentTransactions Collection)
// Purpose: Records details of all financial transactions within the system.
const PaymentTransactionSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the payment transaction.
  orderId: { type: 'ObjectId', ref: 'Order' }, // Optional: Reference to the Order this transaction is for (if it's an order payment).
  subscriptionId: { type: 'ObjectId', ref: 'Subscription' }, // Optional: Reference to the Subscription this transaction is for (if it's a subscription payment).
  customerId: { type: 'ObjectId', ref: 'User', required: true }, // Reference to the Customer (User) involved in this transaction.
  amount: { type: Number, required: true, min: 0 }, // The amount of the transaction.
  currency: { type: String, required: true, default: 'INR' }, // Currency code of the transaction (e.g., "INR", "USD").
  paymentMethod: { type: String, required: true }, // Method used for payment (e.g., "Credit Card", "UPI", "COD").
  gatewayTransactionId: { type: String, unique: true, sparse: true }, // Unique transaction ID provided by the payment gateway (for online payments).
  status: { type: String, enum: ['Success', 'Failed', 'Pending', 'Refunded'], required: true }, // Status of the transaction.
  transactionTimestamp: { type: Date, default: Date.now }, // Timestamp when the transaction occurred.
  gatewayResponse: { type: Object }, // Optional: Raw JSON object containing the full response from the payment gateway for debugging/auditing.
  // Indexes: customerId, gatewayTransactionId, status, transactionTimestamp
};

// 2. Promotion Model (Promotions Collection)
// Purpose: Manages discount codes and special offers customers can use.
const PromotionSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the promotion.
  code: { type: String, required: true, unique: true }, // The actual promotional code (e.g., "FIRSTORDER10", "FREEDELIVERY").
  name: { type: String, required: true }, // Human-readable name of the promotion.
  description: { type: String }, // Detailed description of the promotion's terms and conditions.
  type: { type: String, enum: ['Percentage', 'Fixed Amount', 'Free Delivery'], required: true }, // Type of discount offered.
  value: { type: Number, required: true, min: 0 }, // The value of the discount (e.g., 10 for 10%, 50 for $50 off).
  minOrderAmount: { type: Number, min: 0 }, // Optional: Minimum order amount required to apply the promotion.
  startDate: { type: Date, required: true }, // Date from which the promotion becomes active.
  endDate: { type: Date, required: true }, // Date when the promotion expires.
  maxUses: { type: Number, min: 0 }, // Optional: Maximum total times this promotion can be used across all customers.
  maxUsesPerCustomer: { type: Number, min: 0 }, // Optional: Maximum times a single customer can use this promotion.
  isActive: { type: Boolean, default: true }, // Indicates if the promotion is currently active and usable.
  createdAt: { type: Date, default: Date.now }, // Timestamp when the promotion record was created.
  updatedAt: { type: Date, default: Date.now }, // Timestamp of the last update to the promotion record.
  // Indexes: code (unique), isActive, endDate
};

// 3. Notification Model (Notifications Collection)
// Purpose: Stores records of automated messages sent to users (for history and in-app display).
const NotificationSchema = {
  _id: { type: 'ObjectId', auto: true }, // Unique identifier for the notification record.
  userId: { type: 'ObjectId', ref: 'User', required: true }, // Reference to the User who is the recipient of this notification.
  orderId: { type: 'ObjectId', ref: 'Order' }, // Optional: Reference to the Order if the notification is related to an order.
  subscriptionId: { type: 'ObjectId', ref: 'Subscription' }, // Optional: Reference to the Subscription if the notification is related to a subscription.
  type: {
    type: String,
    required: true,
    enum: [
      'Order Confirmation', 'Payment Reminder', 'Delivery Update',
      'Subscription Renewal', 'Promotion', 'Account Update', 'System Alert'
    ],
  }, // Categorization of the notification type.
  messageContent: { type: String, required: true }, // The actual text content of the notification.
  deliveryMethod: { type: String, enum: ['SMS', 'Email', 'In-App'], required: true }, // How the notification was delivered or intended to be delivered.
  timestamp: { type: Date, default: Date.now }, // Timestamp when the notification was created/sent.
  isRead: { type: Boolean, default: false }, // For in-app notifications: indicates if the user has viewed it.
  status: { type: String, enum: ['Sent', 'Failed', 'Pending'], default: 'Pending' }, // Delivery status of the notification.
  // Indexes: userId, timestamp, isRead
};

// --- Example of how you might define a Mongoose model in Node.js ---
/*
// Assuming you have mongoose installed and connected
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema(UserSchema, { timestamps: { createdAt: 'registrationTimestamp', updatedAt: 'lastActivityTimestamp' } }));
const Address = mongoose.model('Address', new mongoose.Schema(AddressSchema));
const Staff = mongoose.model('Staff', new mongoose.Schema(StaffSchema, { timestamps: true })); // Mongoose adds createdAt/updatedAt
const Product = mongoose.model('Product', new mongoose.Schema(ProductSchema, { timestamps: true }));
const InventoryLog = mongoose.model('InventoryLog', new mongoose.Schema(InventoryLogSchema));
const Order = mongoose.model('Order', new mongoose.Schema(OrderSchema, { timestamps: true }));
const OrderItem = mongoose.model('OrderItem', new mongoose.Schema(OrderItemSchema));
const Subscription = mongoose.model('Subscription', new mongoose.Schema(SubscriptionSchema, { timestamps: true }));
const SubscriptionItem = mongoose.model('SubscriptionItem', new mongoose.Schema(SubscriptionItemSchema));
const DeliveryDriver = mongoose.model('DeliveryDriver', new mongoose.Schema(DeliveryDriverSchema, { timestamps: true }));
const Zone = mongoose.model('Zone', new mongoose.Schema(ZoneSchema));
const DeliveryProof = mongoose.model('DeliveryProof', new mongoose.Schema(DeliveryProofSchema));
const PaymentTransaction = mongoose.model('PaymentTransaction', new mongoose.Schema(PaymentTransactionSchema));
const Promotion = mongoose.model('Promotion', new mongoose.Schema(PromotionSchema, { timestamps: true }));
const Notification = mongoose.model('Notification', new mongoose.Schema(NotificationSchema, { timestamps: true }));

module.exports = {
  User,
  Address,
  Staff,
  Product,
  InventoryLog,
  Order,
  OrderItem,
  Subscription,
  SubscriptionItem,
  DeliveryDriver,
  Zone,
  DeliveryProof,
  PaymentTransaction,
  Promotion,
  Notification,
};
*/
