const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.user = user.email;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
    this.from = ` Micheal Awoniran ${process.env.EMAIL_USERNAME}`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else if (process.env.NODE_ENV === 'production') {
      return 1;
    }
  }
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // res.render(`${__dirname}/../views/emails/${template}.html`);
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send(
      'Welcome',
      'Welcome to Task Manager, Make Good use of your time'
    );
  }
};
const sendEmail = async (options) => {};
