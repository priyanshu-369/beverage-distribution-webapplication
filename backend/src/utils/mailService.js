import fs from "fs"
import path from "path"
import nodemailer from "nodemailer"

const templateCache = {};

function loadTemplate(name) {
  if (!templateCache[name]) {
    const templatePath = path.join(__dirname, 'emailTemplates', `${name}.html`);
    const html = fs.readFileSync(templatePath, 'utf-8');
    templateCache[name] = html;
  }
  return templateCache[name];
}

function fillTemplate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');
}

async function sendEmail({ to, subject, templateName, variables }) {
  const template = loadTemplate(templateName);
  const html = fillTemplate(template, variables);

  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

export {  sendEmail };
