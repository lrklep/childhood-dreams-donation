import { useState } from 'react';

export default function DonationSection({ 
  category, 
  selectedAmount, 
  setSelectedAmount, 
  selectedItem, 
  setSelectedItem,
  sectionType 
}) {
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
            sectionType
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
          color: sectionType === 'kids' ? '#FF69B4' : '#00CED1',
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
            sectionType
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
    <div className="donation-section">
      <div className="category-header">
        <div className="blink-text">
          <h2>{category.title}</h2>
        </div>
        <p className="category-subtitle">{category.subtitle}</p>
      </div>

      {/* Item Selection Grid */}
      <div className="items-grid">
        {category.amounts.map(({ value, item, impact, emoji }) => (
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
              <tr>
                <td>
                  <center>
                    <font color="#00FF00" size="4">
                      <b>
                        {sectionType === 'kids' ? 
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
                      placeholder={sectionType === 'kids' ? 
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
                      className="payment-button mega-blink"
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
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
