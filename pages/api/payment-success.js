import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email transporter setup - CORRECT METHOD NAME
const transporter = nodemailer.createTransport({
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

  const { paymentId, orderId, signature, donorInfo, amount } = req.body;

  try {
    // Verify Razorpay signature
    const isValidPayment = verifyRazorpaySignature(paymentId, orderId, signature);
    
    if (!isValidPayment) {
      console.error('Invalid payment signature');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('Payment verified successfully for:', donorInfo.name, amount);

    // Generate personalized thank you email with Gemini Pro
    const thankYouContent = await generateChildhoodThankYouWithGemini(donorInfo, amount);
    
    // Send email
    await sendThankYouEmail(donorInfo.email, donorInfo.name, thankYouContent, donorInfo.selectedItem);

    console.log('Thank you email sent to:', donorInfo.email);

    res.status(200).json({ 
      success: true, 
      message: 'Payment processed and thank you email sent!' 
    });
    
  } catch (error) {
    console.error('Payment processing failed:', error);
    res.status(500).json({ 
      error: 'Failed to process payment',
      details: error.message 
    });
  }
}

function verifyRazorpaySignature(paymentId, orderId, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  
  return expectedSignature === signature;
}

async function generateChildhoodThankYouWithGemini(donorInfo, amount) {
  const { name, age, story, selectedItem, sectionType } = donorInfo;
  
  const prompt = `
Generate a heartfelt, personalized thank you email in authentic 90s internet style for ${name} (age: ${age || 'not provided'}) who just donated ₹${amount} for "${selectedItem.item}".

Context: This is a donation site where people fund childhood experiences they couldn't have - both for current kids and adults who missed out on childhood dreams.

Donor Details:
- Section: ${sectionType} (kids section = helping children, adultKids = helping adults fulfill missed childhood dreams)
- Their personal story: "${story || 'No personal story shared'}"
- Item they funded: "${selectedItem.item}"
- Impact created: "${selectedItem.impact}"

Requirements:
- Use authentic 90s internet style with ASCII art borders
- Reference childhood nostalgia and healing inner child themes
- Be emotionally resonant and acknowledge their personal connection
- Include specific impact of their ₹${amount} donation
- Add multiple exclamation points and 90s cyber-slang
- Reference "cyberspace", "information superhighway", "digital revolution"
- Keep under 300 words
- Make them feel they're healing their own inner child while helping others
- If they shared a personal story, reference it meaningfully
- Use ASCII borders like ═══ and ║

Style examples: "CHILDHOOD DREAMS NETWORK", "HEALING THROUGH CYBERSPACE", "DIGITAL DREAM FULFILLMENT"

Tone: Mix nostalgic warmth with 90s cyber-optimism and genuine gratitude.

Format: Include ASCII art borders at top and bottom, use caps for emphasis, include multiple celebration emojis.
  `;

  try {
    // Get the Gemini Pro model (using gemini-1.5-flash which is fast and cost-effective)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
    
  } catch (error) {
    console.error('Gemini API failed:', error);
    // Fallback to template-based message
    return generateChildhoodFallback(name, amount, selectedItem, story, sectionType);
  }
}

function generateChildhoodFallback(name, amount, selectedItem, story, sectionType) {
  const personalNote = story ? 
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
${selectedItem.emoji || '🌟'} Item: ${selectedItem.item}
🎯 Impact: ${selectedItem.impact}
🚀 Status: ${sectionMessage}

${personalNote}

You've just joined the CHILDHOOD DREAMS REVOLUTION through the power of the INFORMATION SUPERHIGHWAY! Every click, every donation, every smile you create ripples through cyberspace!

Your inner child is probably doing a victory dance right now! 💃🕺

═══════════════════════════════════════════════════════
            IMPACT THROUGH THE DIGITAL AGE!
═══════════════════════════════════════════════════════

🌐 Visit our website for updates on your dream fulfillment
💌 Share this joy on the World Wide Web  
🎮 Keep spreading childhood magic through technology!

WELCOME TO THE FUTURE OF GIVING!

Forever grateful in the digital realm,
The Childhood Dreams Team 🚀

P.S. Your donation confirmation details are attached. Keep being AWESOME through cyberspace!

╔════════════════════════════════════════════════════════╗
║    "Healing yesterday, creating tomorrow!" - Est. 2025 ║
╚════════════════════════════════════════════════════════╝
  `;
}

async function sendThankYouEmail(email, name, content, selectedItem) {
  const subject = `🌟 ${selectedItem.emoji || '✨'} THANK YOU ${name.toUpperCase()} - ${selectedItem.item} DREAM ACTIVATED! 🚀`;
  
  const htmlContent = `
    <div style="font-family: 'Courier New', monospace; background: #000080; color: #00FF00; padding: 30px; border: 5px solid #FFFF00;">
      <pre style="color: #00FF00; font-size: 14px; line-height: 1.4; white-space: pre-wrap;">${content}</pre>
      
      <div style="margin-top: 30px; text-align: center; border: 3px solid #FF69B4; padding: 20px; background: #FF1493;">
        <p style="color: #FFFFFF; font-size: 16px; font-weight: bold; margin: 0;">
          🎯 DONATION DETAILS 🎯<br/>
          Item: ${selectedItem.item}<br/>
          Impact: ${selectedItem.impact}
        </p>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #FFFF00; font-size: 12px;">
          This email was sent through our secure CYBER-NETWORK!<br/>
          Childhood Dreams Foundation | Est. 2025 | Healing through Technology
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"🌟 Childhood Dreams Network" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: content,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
}
