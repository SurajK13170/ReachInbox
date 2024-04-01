const express = require("express")
const googlerouter = express.Router()
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { google } = require("googleapis");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);



googlerouter.get("/google", passport.authenticate("google", { scope: ["profile", "email", 'https://www.googleapis.com/auth/gmail.readonly', "https://www.googleapis.com/auth/gmail.send"], accessType: 'offline', prompt: 'consent' }));

googlerouter.get("/google/callback", passport.authenticate("google"), (req, res) => {
  res.redirect("/auth/gmail");
});

googlerouter.get("/gmail", async (req, res) => {
  const { accessToken, refreshToken } = req.user.tokens;

  const oauth2Client = new google.auth.OAuth2(
    process.env.ClientId,
    process.env.ClientSecret,
    process.env.REDIRECT_URL
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
  });

  // GETTING MAIL LIST 

  try {
    const mailReply = async () => {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 1
      });
      
      const messages = response.data.messages;
      if (messages.length === 0) {
        return res.json({ message: 'No unread emails found.' });
      }
  
      const messageId = messages[0].id;
  
      const messageDetails = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });
  
      const email = {
        id: messageId,
        subject: messageDetails.data.payload.headers.find(header => header.name === 'Subject').value,
        body: messageDetails.data.snippet
      };

      // AI part
  
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You received an email with the subject: "${email.subject}" and the following content: "${email.body}". Please draft a reply:`
  
      const result = await model.generateContent(prompt);
      const res = await result.response;
      const replyText = res.text();
  
// MESSAGE REPLY
      const replyMessage = {
        to: messageDetails.data.payload.headers.find(header => header.name === 'From').value,
        subject: 'Re: ' + email.subject,
        text: replyText
      };
      console.log(replyMessage.to)
      const rawMessage = Buffer.from(
        'To: ' + replyMessage.to + '\r\n' +
        'Subject: ' + replyMessage.subject + '\r\n\r\n' +
        replyMessage.text
      ).toString('base64');
  
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage
        }
      });
  
      console.log("Reply sent successfully:", replyText);
      
    }

    setInterval(mailReply, 1000 * 60)

  } catch (error) {
    console.error("Error generating or sending reply message:", error);
    res.status(500).send("Error generating or sending reply message: " + error.message);
  }

  res.status(200).send("Auto reply enabled successfully!")
});

module.exports = {googlerouter}