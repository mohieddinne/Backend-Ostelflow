const nodemailer = require("nodemailer");
const handlebars = require("express-handlebars");
const hbs = require("nodemailer-express-handlebars");
const i18nHelper = require("./i18n.helper");
const utilsHelpers = require("./utils.helper");
const path = require("path");

const emailHelpers = {
  transporter: null,
  options: {
    from: null,
  },
  async createTransport() {
    // Creat the mail transporter
    const mailConfig = {
      host: config.email.host,
      port: parseInt(config.email.port),
      secure: config.email.secure,
      requireTLS: config.email.require_TLS,
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    };
    const mailTransport = nodemailer.createTransport(mailConfig);

    // Get the Handlebars optionq
    const hls = handlebars.create({
      extName: ".hbs",
      partialsDir: path.join(
        __dirname,
        "../../assets/email-templates/partials"
      ),
      layoutsDir: path.join(__dirname, "../../assets/email-templates"),
      defaultLayout: false,
      helpers: {
        translate: (str) => {
          return i18nHelper != undefined ? i18nHelper.__(str) : str;
        },
        t: (str) => {
          return i18nHelper != undefined ? i18nHelper.__(str) : str;
        },
        // TODO add a greating by gender
        greetingByGender: function (name, sexe) {
          /* if (sexe == undefined || sexe == "M") {
            return i18nHelper.__("HELLO_M") + " " + name;
          } else {
            return i18nHelper.__("HELLO_F") + " " + name;
          }*/
          const hours = new Date().getHours();
          if (hours >= 6 && hours < 18)
            return i18nHelper.__("Hello_DAY") + " " + name;
          return i18nHelper.__("HELLO_NIGHT") + " " + name;
        },
        currentYear: function () {
          return new Date().getFullYear();
        },
      },
    });

    const handlebarOptions = {
      viewEngine: hls,
      viewPath: path.join(__dirname, "../../assets/email-templates"),
    };

    this.options.from = await this.getNoReplyEmailAsync();

    mailTransport.use("compile", hbs(handlebarOptions));
    this.transporter = mailTransport;
    return mailTransport;
  },
  verify() {
    return new Promise((resolve, reject) => {
      if (!this.transporter) reject(false);
      this.transporter
        .verify()
        .then(() => resolve(true))
        .catch(() => reject(false));
    });
  },
  async sendMail(options) {
    const transporter = this.transporter;
    if (!options.from) {
      options.from = this.options.from;
    }
    if (options.subject) {
      options.subject = await this.subject(options.subject);
    }
    console.log(options);
    return new Promise((resolve, reject) => {
      transporter.sendMail(options, function (error, info) {
        if (error) reject(error);
        else resolve(info);
      });
    });
  },
  renderEmailSubject(str) {
    const prefix = emailService.prefix || "";
    const subject = i18nHelper.__(str);
    if (prefix == "") return subject;
    return prefix + " | " + subject;
  },
  subject(a) {
    this.renderEmailSubject(a);
  },
  async getNoReplyEmail() {
    return emailService.defaultAddress || null;
  },
  async getNoReplyEmailAsync() {
    const [email, companyName] = await utilsHelpers.getOptions(
      "email_default_address",
      "email_defautl_sender_name"
    );
    return companyName + " <" + email + ">";
  },
};
module.exports = emailHelpers;
