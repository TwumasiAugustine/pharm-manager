const mongoose = require('mongoose');
require('dotenv').config();

// Since we're using TypeScript, we'll define the schema here
const saleSchema = new mongoose.Schema(
    {
        items: [
            {
                drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
                quantity: Number,
                priceAtSale: Number,
                saleType: String,
                profit: Number,
            },
        ],
        totalAmount: Number,
        paymentMethod: String,
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
        branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
        soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        finalized: Boolean,
        transactionId: String,
        shortCode: String,
    },
    {
        timestamps: true,
    },
);

const Sale = mongoose.model('Sale', saleSchema);

async function checkSales() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Find all sales
        const sales = await Sale.find({})
            .populate('items.drug', 'name')
            .populate('branch', 'name')
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        console.log(`\nTotal sales found: ${sales.length}`);

        if (sales.length > 0) {
            console.log('\n=== SALES RECORDS ===');
            sales.forEach((sale, index) => {
                console.log(`\nSale #${index + 1}:`);
                console.log(`ID: ${sale._id}`);
                console.log(`Date: ${sale.createdAt}`);
                console.log(`Total Amount: ${sale.totalAmount}`);
                console.log(`Payment Method: ${sale.paymentMethod}`);
                console.log(`Customer: ${sale.customer?.name || 'Walk-in'}`);
                console.log(`Branch: ${sale.branch?.name || 'Unknown'}`);
                console.log(`Items:`);
                sale.items.forEach((item, itemIndex) => {
                    console.log(
                        `  Item ${itemIndex + 1}: ${item.drug?.name || 'Unknown'} - Qty: ${item.quantity} - Price: ${item.priceAtSale}`,
                    );
                });
                console.log(`Finalized: ${sale.finalized}`);
                console.log('---');
            });
        } else {
            console.log('\nNo sales found in database.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from database');
        process.exit();
    }
}

checkSales();
