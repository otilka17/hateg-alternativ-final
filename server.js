const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:5000",
      "https://otilka17.github.io",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Hațeg Alternativ funcționează ✔️");
});

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sanitize = (value = "") => {
  return String(value).trim();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const interest = sanitize(req.body.interest);
  const message = sanitize(req.body.message);

  if (!name || !email || !interest || !message) {
    return res.status(400).json({
      message: "Toate câmpurile sunt obligatorii.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Adresa de email nu este validă.",
    });
  }

  try {
    await transporter.sendMail({
      from: `"Hațeg Alternativ" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.RECEIVER_EMAIL,
      subject: `Mesaj nou - ${interest}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2 style="margin-bottom: 16px;">Cerere nouă de pe Hațeg Alternativ</h2>
          <p><strong>Nume:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Interes:</strong> ${interest}</p>
          <p><strong>Mesaj:</strong></p>
          <p>${message.replace(/\\n/g, "<br>")}</p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Mesaj trimis cu succes.",
    });
  } catch (error) {
    console.error("Eroare email:", error);
    return res.status(500).json({
      message: "Eroare la trimiterea mesajului.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});
