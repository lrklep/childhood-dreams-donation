import crypto from 'crypto';
import getRawBody from 'raw-body';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email transporter - CORRECT METHOD NAME
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const config = {
  api: {
    bodyParser: false, // Important for signature verification
  },
};

export default async function handler(req, res) {
  console.log('🔔 Webhook received at:', new Date().toISOString());
  
  if (req.method !== 'POST') {
    console.log('❌ Wrong method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get raw body for signature verification
    const buf = await getRawBody(req);
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Debug logging
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🔐 Webhook secret exists:', !!webhookSecret);
    console.log('📝 Received signature:', signature);
    console.log('📦 Body length:', buf.length);
    
    // Check if webhook secret exists
    if (!webhookSecret) {
      console.error('❌ RAZORPAY_WEBHOOK_SECRET not found in environment');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(buf)
      .digest('hex');

    console.log('🔍 Expected signature:', expectedSignature);
    console.log('✅ Signatures match:', signature === expectedSignature);

    if (signature !== expectedSignature) {
      console.error('❌ Signature verification failed');
      console.error('   Received:', signature);
      console.error('   Expected:', expectedSignature);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('✅ Signature verified successfully');

    // Parse webhook payload
    const payload = JSON.parse(buf.toString());
    console.log('📦 Event type:', payload.event);

    // Only process payment.captured events
    if (payload.event !== 'payment.captured') {
      console.log('ℹ️ Ignoring event:', payload.event);
      return res.status(200).json({ status: 'Event ignored' });
    }

    // Extract payment and order data
    const payment = payload.payload.payment.entity;
    const order = payload.payload.order?.entity;

    console.log('💰 Payment ID:', payment.id);
    console.log('📋 Order ID:', order?.id);
    console.log('💳 Customer email:', payment.email);

    // Extract donor information from order notes
    const donorInfo = {
      name: order?.notes?.donor_name || 'Valued Donor',
      email: payment.email,
      phone: payment.contact,
      age: order?.notes?.donor_age || 'Not provided',
      story: order?.notes?.donor_story || 'No story shared',
      selectedItem: {
        item: order?.notes?.selected_item || 'Childhood Dream',
        impact: order?.notes?.selected_impact || 'Making dreams come true',
        emoji: order?.notes?.selected_emoji || '🌟'
      },
      sectionType: order?.notes?.section_type || 'kids'
    };

    const amount = payment.amount / 100; // Convert from paise to rupees

    console.log('👤 Preparing to send email to:', donorInfo.email);

    // Generate and send personalized email
    await sendCustomEmail(donorInfo, amount, payment.id);

    console.log('✅ Email sent successfully');
    return res.status(200).json({ status: 'success', processed: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}

async function sendCustomEmail(donorInfo, amount, paymentId) {
  try {
    console.log('🤖 Generating AI email content...');
    
    // Generate personalized content with Gemini AI
    const emailContent = await generateEmailWithGemini(donorInfo, amount);
    
    // Send email
    const mailOptions = {
      from: `"🌟 Childhood Dreams Network" <${process.env.EMAIL_USER}>`,
      to: donorInfo.email,
      subject: `🎉 THANK YOU ${donorInfo.name.toUpperCase()} - ${donorInfo.selectedItem.item} DREAM ACTIVATED! 🚀`,
      text: emailContent,
      html: `
        <div style="font-family: 'Courier New', monospace; background: #000080; color: #00FF00; padding: 30px; border: 5px solid #FFFF00; max-width: 700px; margin: 0 auto;">
          <pre style="color: #00FF00; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${emailContent}</pre>
          
          <div style="margin-top: 20px; text-align: center; border: 3px solid #FF69B4; padding: 15px; background: #FF1493;">
            <h3 style="color: #FFFFFF; margin: 0;">🎯 PAYMENT CONFIRMATION 🎯</h3>
            <p style="color: #FFFFFF; margin: 10px 0;">
              Amount: ₹${amount.toLocaleString()}<br/>
              Item: ${donorInfo.selectedItem.item}<br/>
              Payment ID: ${paymentId}
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent to:', donorInfo.email);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

async function generateEmailWithGemini(donorInfo, amount) {
  const prompt = `Generate a heartfelt, personalized thank you email in authentic 90s internet style for ${donorInfo.name} (age: ${donorInfo.age}) who donated ₹${amount} for "${donorInfo.selectedItem.item}".

Their story: "${donorInfo.story}"
Section: ${donorInfo.sectionType}
Impact: ${donorInfo.selectedItem.impact}

Requirements:
- Use 90s internet style with ASCII borders
- Reference childhood nostalgia themes  
- Include specific donation impact
- Keep under 300 words
- Use caps for emphasis and celebration
- Include ASCII art borders like ═══

Style: Mix nostalgic warmth with 90s cyber-optimism.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('❌ Gemini API failed, using fallback:', error);
    
    // Fallback email
    return `
╔════════════════════════════════════════════════════════╗
║           🌟 CHILDHOOD DREAMS NETWORK 🌟               ║
║        CONNECTING HEARTS THROUGH CYBERSPACE!           ║
╚════════════════════════════════════════════════════════╝

GREETINGS FROM THE DIGITAL FRONTIER, ${donorInfo.name}!!!

🎉 MISSION STATUS: CHILDHOOD DREAM ACTIVATED! 🎉

Thank you for your INCREDIBLE ₹${amount.toLocaleString()} donation!!!

✨ DREAM FULFILLED DETAILS ✨
${donorInfo.selectedItem.emoji} Item: ${donorInfo.selectedItem.item}
🎯 Impact: ${donorInfo.selectedItem.impact}

${donorInfo.story && donorInfo.story !== 'No story shared' ? 
  `\nYour story about "${donorInfo.story}" really touched us. By helping others, you're healing that part of yourself that once wished for more.\n` : 
  `\nWe know everyone has childhood dreams that didn't come true. Thank you for turning that experience into someone else's joy!\n`
}

You've just joined the CHILDHOOD DREAMS REVOLUTION through the power of the INFORMATION SUPERHIGHWAY!

Your inner child is probably doing a victory dance right now! 💃🕺

═══════════════════════════════════════════════════════
            IMPACT THROUGH THE DIGITAL AGE!
═══════════════════════════════════════════════════════

Forever grateful in the digital realm,
The Childhood Dreams Team 🚀

╔════════════════════════════════════════════════════════╗
║    "Healing yesterday, creating tomorrow!" - Est. 2025 ║
╚════════════════════════════════════════════════════════╝
    `;
  }
}
