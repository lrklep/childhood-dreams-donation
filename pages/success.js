import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
  const router = useRouter();
  const { item, amount } = router.query;

  return (
    <>
      <Head>
        <title>🎉 DREAM ACTIVATED - Success! 🎉</title>
      </Head>

      <div className="retro-container">
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          {/* Animated Success Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 className="blink-text" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              color: '#FFD700',
              textShadow: '4px 4px #FF0000, 8px 8px #00FF00, 12px 12px #FF69B4',
              marginBottom: '20px'
            }}>
              🎉 MISSION ACCOMPLISHED! 🎉
            </h1>
            <h2 className="blink-text">
              CHILDHOOD DREAM SUCCESSFULLY ACTIVATED!
            </h2>
          </div>

          {/* Success Animation */}
          <div style={{ margin: '40px 0' }}>
            <marquee behavior="scroll" direction="left" scrollamount="8">
              🚀 SUCCESS! SUCCESS! SUCCESS! DREAM FULFILLED! SUCCESS! SUCCESS! 🚀
            </marquee>
            <marquee behavior="scroll" direction="right" scrollamount="6">
              ⭐ CHILDHOOD MAGIC DEPLOYED THROUGH CYBERSPACE! ⭐
            </marquee>
          </div>

          {/* Success Details */}
          <div style={{ margin: '50px auto', maxWidth: '600px' }}>
            <table border="5" cellPadding="25" bgcolor="#000080" width="100%">
              <tbody>
                <tr>
                  <td align="center">
                    <font color="#FFD700" size="5">
                      <b>🎯 MISSION DETAILS 🎯</b>
                    </font>
                    <br/><br/>
                    
                    {item && amount && (
                      <>
                        <font color="#00FF00" size="4">
                          <b>Dream Item: {decodeURIComponent(item)}</b>
                        </font>
                        <br/>
                        <font color="#FF69B4" size="4">
                          <b>Amount: ₹{parseInt(amount).toLocaleString()}</b>
                        </font>
                        <br/><br/>
                      </>
                    )}
                    
                    <font color="#FFFF00" size="3">
                      <b>✨ STATUS: DREAM ACTIVATION COMPLETE! ✨</b>
                    </font>
                    <br/><br/>
                    
                    <font color="#00CED1" size="3">
                      🎮 Payment processed successfully!<br/>
                      💌 Personalized thank you email sent!<br/>
                      🌟 Dream fulfillment process initiated!<br/>
                      🚀 Impact multiplying through cyberspace!
                    </font>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', margin: '50px 0', flexWrap: 'wrap' }}>
            <button 
              className="payment-button"
              onClick={() => router.push('/')}
              style={{ minWidth: '200px' }}
            >
              🚀 FUND ANOTHER DREAM 🚀
            </button>
            
            <button 
              className="payment-button"
              onClick={() => window.open('mailto:?subject=I just helped fulfill a childhood dream!&body=I donated through the Childhood Dreams Network and helped someone experience what they couldn\'t have as a kid. Check it out!', '_blank')}
              style={{ minWidth: '200px' }}
            >
              📧 SHARE THIS JOY 📧
            </button>
          </div>

          {/* Footer Message */}
          <div style={{
            margin: '60px 0 20px 0',
            padding: '20px',
            background: 'linear-gradient(45deg, #FF69B4, #00CED1)',
            border: '4px solid #FFFF00'
          }}>
            <marquee behavior="alternate" scrollamount="4">
              💫 Thank you for being part of the Digital Dream Revolution! 💫
            </marquee>
          </div>
        </div>
      </div>
    </>
  );
}
