// Test script to verify data storage is working
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/techfest_registration';

console.log('\n🔍 Testing MongoDB Connection and Data Storage...\n');
console.log('MongoDB URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB\n');
  testDataStorage();
})
.catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

async function testDataStorage() {
  try {
    // Define schema
    const registrationSchema = new mongoose.Schema({
      full_name: String,
      email: String,
      phone: String,
      technical_event: String,
      total_fee: Number,
      payment_mode: String,
      created_at: { type: Date, default: Date.now },
      status: { type: String, default: 'completed' }
    });

    const Registration = mongoose.model('Registration', registrationSchema);

    // Check existing data
    const existingCount = await Registration.countDocuments();
    console.log(`📊 Total registrations in database: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log('📝 Recent registrations:');
      const recent = await Registration.find().sort({ created_at: -1 }).limit(3);
      recent.forEach((reg, i) => {
        console.log(`  ${i+1}. ${reg.full_name} (${reg.email}) - ${reg.created_at.toISOString()}`);
      });
      console.log('');
    }

    // Test write operation
    console.log('🧪 Testing write operation...');
    const testReg = new Registration({
      full_name: 'Test Registration - ' + new Date().getTime(),
      email: 'test@techfest.local',
      phone: '1234567890',
      technical_event: 'Web Development',
      total_fee: 500,
      payment_mode: 'UPI'
    });

    const saved = await testReg.save();
    console.log('✅ Successfully saved test registration!');
    console.log(`   ID: ${saved._id}`);
    console.log(`   Name: ${saved.full_name}\n`);

    // Verify read operation
    const newCount = await Registration.countDocuments();
    console.log(`✅ Database now has ${newCount} registrations (was ${existingCount})`);
    console.log('\n🎉 Data storage is working correctly!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    process.exit(1);
  }
}
