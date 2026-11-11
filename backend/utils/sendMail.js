import sgMail from '@sendgrid/mail';

sgMail.setApiKey('ss');
const sendEmail = (receiver, source, subject, content) => {
  try {
    const data = {
      to: receiver,
      from: source,
      subject,
      html: content,
    };

    return sgMail.send(data);
  } catch (e) {
    return new Error(e);
  }
};

export { sendEmail };
