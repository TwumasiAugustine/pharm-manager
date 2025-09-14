import mongoose from 'mongoose';
import User from '../src/models/user.model';
import bcrypt from 'bcryptjs';

async function checkUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/');
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'admin@example.com' });
        if (user) {
            console.log('User found:', {
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                pharmacyId: user.pharmacyId,
                hasPassword: !!user.password,
                passwordHash: user.password, // Show the actual hash to check if it's hashed
            }); // Test if password was double-hashed
            console.log('Testing if password was double-hashed:');

            // First, hash "securepassword" once (like the script does)
            const singleHashed = await bcrypt.hash('securepassword', 10);
            console.log('Single hash result:', singleHashed);

            // Then test if the stored password is a hash of this single hash
            const doubleHashTest = await bcrypt.compare(
                singleHashed,
                user.password,
            );
            console.log('Double hash test:', doubleHashTest);
        } else {
            console.log('User not found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
