import Head from 'next/head';
import { useState } from 'react';

const donationCategories = {
  kids: {
    title: "🎮 HELP A KID EXPERIENCE CHILDHOOD",
    subtitle: "Give them what you wished you had",
    amounts: [
      { 
        value: 1000, 
        item: "Art Supply Kit", 
        impact: "1 kid gets to create their first masterpiece",
        emoji: "🎨"
      },
      { 
        value: 3000, 
        item: "Remote Control Car", 
        impact: "1 kid experiences the joy of their first RC car",
        emoji: "🚗"
      },
      { 
        value: 8000, 
        item: "Professional Bicycle", 
        impact: "1 kid learns to ride & explores the neighborhood",
        emoji: "🚴"
      },
      { 
        value: 15000, 
        item: "Nintendo Switch", 
        impact: "1 kid joins their friends in gaming adventures",
        emoji: "🎮"
      },
      { 
        value: 40000, 
        item: "PlayStation 5", 
        impact: "1 kid gets the console they've been dreaming of",
        emoji: "🎯"
      }
    ]
  },
  adultKids: {
    title: "🚗 FULFILL YOUR INNER CHILD'S DREAM",
    subtitle: "Experience what you couldn't as a kid",
    amounts: [
      { 
        value: 5000, 
        item: "Retro Arcade Day", 
        impact: "1 adult relives childhood arcade memories",
        emoji: "🕹️"
      },
      { 
        value: 15000, 
        item: "Theme Park VIP Experience", 
        impact: "1 adult rides all the rides they missed as a kid",
        emoji: "🎢"
      },
      { 
        value: 35000, 
        item: "Professional Gaming Setup", 
        impact: "1 adult builds the gaming room they always wanted",
        emoji: "🖥️"
      },
      { 
        value: 75000, 
        item: "Luxury Sports Car Day", 
        impact: "1 adult drives their childhood dream car",
        emoji: "🏎️"
      },
      { 
        value: 150000, 
        item: "Disney World Family Trip", 
        impact: "1 family creates the magical memories they missed",
        emoji: "🏰"
      }
    ]
  }
};

export default function Home() {
  const [activeSection, setActiveSection] = useState('kids');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    story: '',
    age: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleItemSelect = (amount, item, impact, emoji) => {
    setSelectedAmount(amount);
    setSelectedItem({ item, impact, emoji });
  };

  const handlePayment = async () => {
    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone) {
      alert('🚨 FILL ALL REQUIRED FIELDS! 🚨');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: selectedAmount, 
          donorInfo: {
            ...donorInfo,
            selectedItem,
            sectionType: activeSection
          }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Razorpay payment options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedAmount * 100,
        currency: 'INR',
        name: `🌟 Childhood Dreams - ${selectedItem.item}`,
        description: `Help make childhood dreams come true!`,
        order_id: data.orderId,
        prefill: {
          name: donorInfo.name,
          email: donorInfo.email,
          contact: donorInfo.phone,
        },
        theme: {
          color: activeSection === 'kids' ? '#FF69B4' : '#00CED1',
        },
        handler: function (response) {
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            console.log('Payment cancelled');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment failed:', error);
      alert('🚨 ERROR IN THE MAINFRAME! 🚨\nPlease try again!');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      await fetch('/api/payment-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          donorInfo: {
            ...donorInfo,
            selectedItem,
            sectionType: activeSection
          },
          amount: selectedAmount
        })
      });

      // Redirect to success page
      window.location.href = `/success?item=${encodeURIComponent(selectedItem.item)}&amount=${selectedAmount}`;
      
    } catch (error) {
      console.error('Post-payment processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Head>
        <title>🎮 CHILDHOOD DREAMS - Fund What You Never Had 🚗</title>
        <meta name="description" content="Help kids and adults experience the childhood joys they couldn't have. From PS5s to sports cars - make dreams come true!" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>

      <div className="retro-container">
        {/* Animated Header */}
        <div className="main-header">
          <div className="blink-text">
            <h1>✨ REMEMBER WHAT YOU COULDN'T HAVE? ✨</h1>
          </div>
          <div className="sub-header">
            <h2>NOW HELP SOMEONE ELSE EXPERIENCE IT!</h2>
          </div>
        </div>

        {/* Emotional Hook Section */}
        <div className="story-section">
          <marquee behavior="scroll" direction="left" scrollamount="6">
            🌟 Turn your childhood disappointments into someone else's greatest joy! 🌟
          </marquee>
          
          <div className="story-text">
            <table border="2" cellPadding="20" bgcolor="#000080" width="100%">
              <tbody>
                <tr>
                  <td align="center">
                    <font color="#FFFF00" size="4">
                      <b>That toy you wanted but couldn't afford...</b><br/>
                      <b>That console that was "too expensive"...</b><br/>
                      <b>That trip your family couldn't take...</b><br/>
                      <b>That experience you had to miss...</b><br/><br/>
                      <font color="#00FF00" size="5">
                        <span className="blink-text">NOW YOU CAN GIVE IT TO SOMEONE ELSE!</span>
                      </font>
                    </font>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Impact Counter */}
        <div className="impact-counter">
          <div className="counter-header">
            <h2 className="blink-text">🌟 CHILDHOOD DREAMS FULFILLED SO FAR 🌟</h2>
            <marquee behavior="scroll" direction="right" scrollamount="4">
              💫 Real people helping real dreams come true! 💫
            </marquee>
          </div>
          
          <div className="stats-container">
            <table border="3" cellPadding="15" bgcolor="#000080" width="100%">
              <tbody>
                <tr>
                  <td width="25%" align="center">
                    <font color="#FFD700" size="6"><b>847</b></font><br/>
                    <font color="#00FF00" size="3"><b>🎮 KIDS HELPED</b></font>
                  </td>
                  <td width="25%" align="center">
                    <font color="#FF69B4" size="6"><b>312</b></font><br/>
                    <font color="#00FF00" size="3"><b>🚗 ADULTS HEALED</b></font>
                  </td>
                  <td width="25%" align="center">
                    <font color="#00CED1" size="6"><b>1159</b></font><br/>
                    <font color="#00FF00" size="3"><b>✨ TOTAL DREAMS</b></font>
                  </td>
                  <td width="25%" align="center">
                    <font color="#FF4500" size="5"><b>₹23.4M</b></font><br/>
                    <font color="#00FF00" size="3"><b>💰 DREAMS FUNDED</b></font>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section Selector */}
        <div className="section-selector">
          <button 
            className={`section-btn ${activeSection === 'kids' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('kids');
              setSelectedAmount(null);
              setSelectedItem(null);
            }}
          >
            🎮 FOR KIDS (Age 5-17)<br/>
            <small>Give them the childhood you wished you had</small>
          </button>
          <button 
            className={`section-btn ${activeSection === 'adultKids' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('adultKids');
              setSelectedAmount(null);
              setSelectedItem(null);
            }}
          >
            🚗 FOR ADULT KIDS (18+)<br/>
            <small>Experience what you missed out on</small>
          </button>
        </div>

        {/* Donation Section */}
        <div className="donation-section">
          <div className="category-header">
            <div className="blink-text">
              <h2>{donationCategories[activeSection].title}</h2>
            </div>
            <p className="category-subtitle">{donationCategories[activeSection].subtitle}</p>
          </div>

          {/* Item Selection Grid */}
          <div className="items-grid">
            {donationCategories[activeSection].amounts.map(({ value, item, impact, emoji }) => (
              <div 
                key={value}
                className={`item-card ${selectedAmount === value ? 'selected' : ''}`}
                onClick={() => handleItemSelect(value, item, impact, emoji)}
              >
                <div className="item-emoji">{emoji}</div>
                <div className="item-price">₹{value.toLocaleString()}</div>
                <div className="item-name">{item}</div>
                <div className="item-impact">{impact}</div>
                {selectedAmount === value && (
                  <div className="selected-indicator blink-text">✨ SELECTED ✨</div>
                )}
              </div>
            ))}
          </div>

          {selectedAmount && (
            <div className="donor-form">
              <div className="selected-item-display">
                <h3 className="blink-text">
                  {selectedItem.emoji} YOU'RE FUNDING: {selectedItem.item} {selectedItem.emoji}
                </h3>
                <p className="impact-text">{selectedItem.impact}</p>
              </div>
              
              <div className="form-container">
                <table border="5" cellPadding="20" bgcolor="#000080" width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <center>
                          <font color="#00FF00" size="4">
                            <b>
                              {activeSection === 'kids' ? 
                                '🎈 HELP A KID GET THEIR DREAM! 🎈' : 
                                '🌟 FULFILL YOUR INNER CHILD! 🌟'
                              }
                            </b>
                          </font>
                        </center>
                        <br/>
                        
                        <div className="form-fields">
                          <input
                            type="text"
                            placeholder="Your Name *"
                            className="retro-input"
                            value={donorInfo.name}
                            onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                            required
                          />
                          
                          <input
                            type="email"
                            placeholder="Email Address *"
                            className="retro-input"
                            value={donorInfo.email}
                            onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                            required
                          />
                          
                          <input
                            type="tel"
                            placeholder="Phone Number *"
                            className="retro-input"
                            value={donorInfo.phone}
                            onChange={(e) => setDonorInfo({...donorInfo, phone: e.target.value})}
                            required
                          />

                          <input
                            type="number"
                            placeholder="Your Age (for personalized thank you)"
                            className="retro-input"
                            value={donorInfo.age}
                            onChange={(e) => setDonorInfo({...donorInfo, age: e.target.value})}
                          />
                          
                          <textarea
                            placeholder={activeSection === 'kids' ? 
                              "What childhood experience did you miss out on? (This helps us write a personal thank you!)" :
                              "Tell us about a childhood dream you never got to fulfill! We'll make your thank you email extra special!"
                            }
                            className="retro-textarea"
                            value={donorInfo.story}
                            onChange={(e) => setDonorInfo({...donorInfo, story: e.target.value})}
                            rows="4"
                          />
                        </div>
                        
                        <br/>
                        
                        <center>
                          <button 
                            className="payment-button blink-text"
                            onClick={handlePayment}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 
                              '🔄 PROCESSING DREAM MAGIC...' : 
                              `🚀 MAKE ${selectedItem.item.toUpperCase()} DREAM COME TRUE - ₹${selectedAmount.toLocaleString()} 🚀`
                            }
                          </button>
                        </center>

                        <br/>
                        
                        <center>
                          <font color="#FFFF00" size="2">
                            <b>💳 Safe & Secure Payment via Razorpay 💳</b><br/>
                            <b>💌 Personalized Thank You Email Guaranteed 💌</b>
                          </font>
                        </center>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Success Stories */}
        <div className="success-stories">
          <div className="stories-header">
            <h2 className="blink-text">🎉 REAL STORIES FROM DREAM MAKERS 🎉</h2>
            <marquee behavior="scroll" direction="left" scrollamount="6">
              💕 These are real people who turned their childhood pain into someone else's joy! 💕
            </marquee>
          </div>
          
          <div className="stories-container">
            <table border="2" cellPadding="15" bgcolor="#FF69B4" width="100%">
              <tbody>
                <tr>
                  <td align="center">
                    <font color="#FFFFFF" size="3">
                      <b>🎮 Rahul, 28, Software Engineer</b><br/>
                      <b>Funded: PlayStation 5</b><br/><br/>
                      <i>"Never had a gaming console growing up. When I saw that 12-year-old's face light up getting his PS5, my inner child finally felt peace!"</i>
                    </font>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <marquee behavior="alternate" scrollamount="3">
            💫 Healing childhood through cyberspace since 2025! 💫
          </marquee>
        </div>
      </div>
    </>
  );
}
