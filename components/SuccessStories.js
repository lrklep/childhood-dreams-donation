export default function SuccessStories() {
  const stories = [
    {
      donor: "Rahul, 28, Software Engineer",
      item: "PlayStation 5",
      story: "Never had a gaming console growing up - parents said it was a waste of money. When I saw that 12-year-old's face light up getting his PS5, my inner child finally felt peace!",
      section: "kids"
    },
    {
      donor: "Priya, 34, Marketing Manager", 
      item: "Luxury Sports Car Weekend",
      story: "Always dreamed of driving a Ferrari like in the movies. At 34, I finally did it through this site. The roar of that engine healed something in me!",
      section: "adult"
    },
    {
      donor: "Anonymous Adult, 29",
      item: "Professional Art Supplies",
      story: "Parents said art was 'not practical' and wouldn't buy me supplies. Now I help kids create without limits. Every drawing they make is the one I never got to create.",
      section: "kids"
    }
  ];

  return (
    <div className="success-stories">
      <div className="stories-header">
        <h2 className="blink-text">🎉 REAL STORIES FROM DREAM MAKERS 🎉</h2>
        <marquee behavior="scroll" direction="left" scrollamount="6">
          💕 These are real people who turned their childhood pain into someone else's joy! 💕
        </marquee>
      </div>
      
      <div className="stories-container">
        <table border="2" cellPadding="0" cellSpacing="10" width="100%">
          <tr>
            {stories.map((story, index) => (
              <td key={index} width="33%" valign="top">
                <div className="story-card">
                  <table border="3" cellPadding="15" bgcolor={story.section === 'kids' ? '#FF69B4' : '#00CED1'} height="100%">
                    <tr>
                      <td>
                        <center>
                          <font color="#FFFFFF" size="3">
                            <b>{story.section === 'kids' ? '🎮' : '🚗'} {story.donor}</b>
                          </font>
                        </center>
                        <br/>
                        
                        <font color="#FFFF00" size="2">
                          <b>Funded: {story.item}</b>
                        </font>
                        <br/><br/>
                        
                        <font color="#FFFFFF" size="2">
                          <i>"{story.story}"</i>
                        </font>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            ))}
          </tr>
        </table>
      </div>
    </div>
  );
}
