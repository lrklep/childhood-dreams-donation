import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== WEBHOOK RECEIVED ===');
  console.log('Event:', req.body.event);

  try {
    // Verify webhook signature for security
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('❌ Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret missing' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Webhook signature verified');

    // Process webhook event
    const event = req.body.event;
    const paymentData = req.body.payload.payment.entity;
    const orderData = req.body.payload.order?.entity;

    console.log('Event type:', event);
    console.log('Payment ID:', paymentData.id);

    // Only process payment.captured events
    if (event === 'payment.captured') {
      // Extract customer and order info
      const customerEmail = paymentData.email;
      const amount = paymentData.amount / 100; // Convert from paise
      const paymentId = paymentData.id;

      // Get order details from notes
      const orderNotes = orderData?.notes || {};
      
      // Prepare donor info for email generation
      const donorInfo = {
        name: orderNotes.donor_name || 'Valued Donor',
        email: customerEmail,
        phone: paymentData.contact,
        age: orderNotes.donor_age || 'Not provided',
        story: orderNotes.donor_story || 'No story shared',
        selectedItem: {
          item: orderNotes.selected_item || 'Childhood Dream',
          impact: orderNotes.selected_impact || 'Making dreams come true',
          emoji: '🌟'
        },
        sectionType: orderNotes.section_type || 'kids'
      };

      console.log('Sending thank you email to:', customerEmail);

      // Generate and send personalized email
      await sendCustomThankYouEmail(donorInfo, amount, paymentId);
      
      console.log('✅ Thank you email sent successfully');
    } else {
      console.log('ℹ️ Ignoring event:', event);
    }

    res.status(200).json({ received: true, event: event });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function sendCustomThankYouEmail(donorInfo, amount, paymentId) {
  try {
    console.log('Generating personalized email content...');
    
    // Generate personalized content with Gemini Pro
    const personalizedContent = await generateThankYouWithGemini(donorInfo, amount);
    
    // Email options with 90s styling
    const mailOptions = {
      from: `"🌟 Childhood Dreams Network" <${process.env.EMAIL_USER}>`,
      to: donorInfo.email,
      subject: `🎉 THANK YOU ${donorInfo.name.toUpperCase()} - ${donorInfo.selectedItem.item} DREAM ACTIVATED! 🚀`,
      text: personalizedContent,
      html: `
        <div style="font-family: 'Courier New', monospace; background: #000080; color: #00FF00; padding: 30px; border: 5px solid #FFFF00; border-radius: 10px; max-width: 700px; margin: 0 auto;">
          <pre style="color: #00FF00; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${personalizedContent}</pre>
          
          <div style="margin-top: 30px; text-align: center; border: 3px solid #FF69B4; padding: 20px; background: #FF1493; border-radius: 8px;">
            <h3 style="color: #FFFFFF; margin: 0 0 15px 0; font-size: 18px;">🎯 PAYMENT CONFIRMATION 🎯</h3>
            <div style="color: #FFFFFF; font-size: 16px; font-weight: bold;">
              <p style="margin: 5px 0;"><strong>💰 Amount:</strong> ₹${amount.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>🎮 Item:</strong> ${donorInfo.selectedItem.item}</p>
              <p style="margin: 5px 0;"><strong>✨ Impact:</strong> ${donorInfo.selectedItem.impact}</p>
              <p style="margin: 5px 0;"><strong>🔢 Payment ID:</strong> ${paymentId}</p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; border-top: 2px solid #FFFF00; padding-top: 15px;">
            <p style="color: #FFFF00; font-size: 12px; margin: 0; line-height: 1.4;">
              💌 This email was generated by our AI system and sent through secure CYBER-NETWORK!<br/>
              🌟 Childhood Dreams Foundation | Est. 2025 | Healing through Technology 🌟
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', donorInfo.email);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

async function generateThankYouWithGemini(donorInfo, amount) {
  const { name, age, story, selectedItem, sectionType } = donorInfo;
  
  const prompt = `Generate a heartfelt, personalized thank you email in authentic 90s internet style for ${name} (age: ${age}) who just donated ₹${amount} for "${selectedItem.item}".

Context: This is a donation site where people fund childhood experiences they couldn't have - both for current kids and adults who missed out.

Donor Details:
- Name: ${name}
- Age: ${age}  
- Section: ${sectionType} (kids = helping children, adultKids = helping adults fulfill missed childhood dreams)
- Their personal story: "${story}"
- Item funded: "${selectedItem.item}"
- Impact: "${selectedItem.impact}"

Requirements:
- Use authentic 90s internet style with ASCII art borders
- Reference childhood nostalgia and healing inner child themes
- Be emotionally resonant and acknowledge their personal connection
- Include specific impact of their donation
- Add multiple exclamation points and 90s cyber-slang
- Reference "cyberspace", "information superhighway", "digital revolution"
- Keep under 300 words
- Make them feel they're healing their own inner child while helping others
- If they shared a personal story, reference it meaningfully
- Use caps for emphasis and celebration

Style: Mix nostalgic warmth with 90s cyber-optimism and genuine gratitude.
Tone: Enthusiastic but heartfelt, like a message from 1995.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('❌ Gemini API failed:', error);
    return generateFallbackEmail(name, amount, selectedItem, story, sectionType);
  }
}

function generateFallbackEmail(name, amount, selectedItem, story, sectionType) {
  const personalNote = story && story !== 'No story shared' ? 
    `\n\nYour story about "${story}" really touched us. By helping others, you're healing that part of yourself that once wished for more.` : 
    `\n\nWe know everyone has childhood dreams that didn't come true. Thank you for turning that experience into someone else's joy!`;

  const sectionMessage = sectionType === 'kids' ? 
    'A child is about to experience pure joy because of your generosity!' :
    'An adult is finally going to experience their childhood dream thanks to you!';

  return `
╔════════════════════════════════════════════════════════╗
║           🌟 CHILDHOOD DREAMS NETWORK 🌟               ║
║        CONNECTING HEARTS THROUGH CYBERSPACE!           ║
╚════════════════════════════════════════════════════════╝

GREETINGS FROM THE DIGITAL FRONTIER, ${name}!!!

🎉 MISSION STATUS: CHILDHOOD DREAM ACTIVATED! 🎉

Thank you for your INCREDIBLE ₹${amount.toLocaleString()} donation!!!

✨ DREAM FULFILLED DETAILS ✨
${selectedItem.emoji} Item: ${selectedItem.item}
🎯 Impact: ${selectedItem.impact}
🚀 Status: ${sectionMessage}

${personalNote}

You've just joined the CHILDHOOD DREAMS REVOLUTION through the power of the INFORMATION SUPERHIGHWAY! Every donation creates ripples of joy through cyberspace!

Your inner child is probably doing a victory dance right now! 💃🕺

═══════════════════════════════════════════════════════
            IMPACT THROUGH THE DIGITAL AGE!
═══════════════════════════════════════════════════════

🌐 Visit our website for more dream fulfillment updates
💌 Share this joy on the World Wide Web  
🎮 Keep spreading childhood magic through technology!

WELCOME TO THE FUTURE OF GIVING!

Forever grateful in the digital realm,
The Childhood Dreams Team 🚀

╔════════════════════════════════════════════════════════╗
║    "Healing yesterday, creating tomorrow!" - Est. 2025 ║
╚════════════════════════════════════════════════════════╝
  `;
}

// Increase body size limit for webhooks
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
