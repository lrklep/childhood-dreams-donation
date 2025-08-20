import { useState } from 'react';

export default function ImpactCounter() {
  const [stats] = useState({
    kidsHelped: 847,
    adultsHelped: 312,
    totalDreams: 1159,
    totalAmount: 23400000,
    ps5sFunded: 67,
    carExperiences: 23,
    toysGifted: 445
  });

  return (
    <div className="impact-counter">
      <div className="counter-header">
        <h2 className="blink-text">🌟 CHILDHOOD DREAMS FULFILLED SO FAR 🌟</h2>
        <marquee behavior="scroll" direction="right" scrollamount="4">
          💫 Real people helping real dreams come true! 💫
        </marquee>
      </div>
      
      <div className="stats-container">
        <table border="3" cellPadding="15" bgcolor="#000080" width="100%">
          <tr>
            <td width="25%" align="center">
              <font color="#FFD700" size="6"><b>{stats.kidsHelped}</b></font><br/>
              <font color="#00FF00" size="3"><b>🎮 KIDS HELPED</b></font>
            </td>
            <td width="25%" align="center">
              <font color="#FF69B4" size="6"><b>{stats.adultsHelped}</b></font><br/>
              <font color="#00FF00" size="3"><b>🚗 ADULTS HEALED</b></font>
            </td>
            <td width="25%" align="center">
              <font color="#00CED1" size="6"><b>{stats.totalDreams}</b></font><br/>
              <font color="#00FF00" size="3"><b>✨ TOTAL DREAMS</b></font>
            </td>
            <td width="25%" align="center">
              <font color="#FF4500" size="5"><b>₹{(stats.totalAmount/1000000).toFixed(1)}M</b></font><br/>
              <font color="#00FF00" size="3"><b>💰 DREAMS FUNDED</b></font>
            </td>
          </tr>
        </table>

        <br/>

        <div className="specific-stats">
          <marquee behavior="scroll" direction="left" scrollamount="5">
            🎮 {stats.ps5sFunded} PlayStation 5s Gifted 🚗 {stats.carExperiences} Dream Car Experiences 🎨 {stats.toysGifted} Toys & Games Delivered 🎢 Countless Smiles Created! 
          </marquee>
        </div>
      </div>
    </div>
  );
}
