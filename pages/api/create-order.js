import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, donorInfo } = req.body;

  if (!amount || !donorInfo?.name || !donorInfo?.email || !donorInfo?.phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `childhood_dream_${Date.now()}`,
      notes: {
        donor_name: donorInfo.name,
        donor_email: donorInfo.email,
        donor_phone: donorInfo.phone,
        donor_age: donorInfo.age || 'Not provided',
        donor_story: donorInfo.story || 'No story shared',
        selected_item: donorInfo.selectedItem?.item || 'Unknown item',
        selected_impact: donorInfo.selectedItem?.impact || 'Impact unknown',
        section_type: donorInfo.sectionType || 'unknown',
        donation_purpose: 'childhood_dreams_fulfillment'
      }
    });

    console.log('Order created:', order.id, 'for amount:', amount);
    res.status(200).json({ orderId: order.id, amount: order.amount });
    
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
}
