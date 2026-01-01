// Mock CSV data for parser tests

export const mockRetailOrdersCSV = `Website,Order ID,Order Date,Purchase Order Number,Currency,Unit Price,Unit Price Tax,Shipping Charge,Total Discounts,Total Owed,Shipment Status,Address,Order Status,Carrier Name and Tracking Number,Item Subtotal,Item Subtotal Tax,Item Total,Title,Category,ASIN/ISBN,UNSPSC Code,Website,Release Date,Condition,Seller,Seller Credentials,List Price Per Unit,Purchase Price Per Unit,Quantity,Payment Instrument Type,Purchase Order Number,PO Line Number,Ordering Customer Email,Shipment Date,Shipping Address Name,Shipping Address Street 1,Shipping Address Street 2,Shipping Address City,Shipping Address State,Shipping Address Zip,Order Status,Carrier Name and Tracking Number,Shipment Status,Payment Method
Amazon.com,123-4567890-1234567,01/15/2024,,USD,29.99,2.40,0.00,0.00,32.39,Delivered,,Closed,,,,32.39,Test Product,Electronics,B00TEST123,,Amazon.com,,New,Amazon.com,,29.99,29.99,1,Visa,,,,01/16/2024,John Doe,123 Main St,,Springfield,IL,62701,Closed,,Delivered,Visa`;

export const mockDigitalItemsCSV = `ASIN,ProductName,OrderId,OrderDate,OriginalQuantity,OurPrice,OurPriceCurrencyCode,OurPriceTax,FulfilledDate,FullfilmentStatus,Currency Code,ListPriceAmount,ListPriceCurrencyCode,SellingPriceAmount,SellingPriceCurrencyCode,OrderingCustomerNickname,ShipmentStatus,RefundAmount,RefundCurrencyCode,RefundTaxAmount,RefundTaxCurrencyCode,SubscriptionLength,ProductType
B00TEST123,Kindle Book,123-4567890-1234567,01/15/2024,1,9.99,USD,0.00,01/15/2024,Fulfilled,USD,9.99,USD,9.99,USD,johndoe,Delivered,0.00,USD,0.00,USD,,E-Book`;

export const mockReturnsCSV = `Order ID,Order Date,Return Request Date,Return Request Status,Amazon RMA #,Merchant RMA #,Label Cost,Label Type,Return Carrier,Tracking ID,Return Quantity,Refund Amount,Currency,Refund Reason,Item Name,Quantity,Return Reason Category
123-4567890-1234567,01/15/2024,01/20/2024,Refund Completed,RMA123,,0.00,Amazon Label,USPS,TRACK123,1,29.99,USD,Defective,Test Product,1,Defective`;

export const mockMalformedCSV = `Website,Order ID,Order Date
Amazon.com,"123-4567890-1234567",01/15/2024
Amazon.com,"456-7890123-4567890"
,,"incomplete row"`;

export const mockEmptyCSV = `Website,Order ID,Order Date`;

export const mockCSVWithBOM = '\ufeff' + mockRetailOrdersCSV;

export const mockCSVWithInternationalChars = `Website,Order ID,Order Date,Purchase Order Number,Currency,Unit Price,Unit Price Tax,Shipping Charge,Total Discounts,Total Owed,Title
Amazon.fr,123-4567890-1234567,01/15/2024,,EUR,29.99,5.99,3.50,0.00,39.48,Café Français Spécial`;
