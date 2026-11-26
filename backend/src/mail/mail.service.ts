import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { Customer } from '../customers/customer.entity';

// test domains like example.com can't receive mail
function isReservedAddress(email: string) {
  const domain = String(email).split('@').pop().toLowerCase();
  return /(^|\.)example\.(com|org|net)$/.test(domain) || /(^|\.)(test|example|invalid|localhost)$/.test(domain);
}

// escape html in names
function plain(text: string) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function properName(text: string) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

// sends the QR card to new members (gmail smtp)
// if MAIL_* is not set in .env, email is just turned off
@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private readonly postman: nodemailer.Transporter | null;
  private readonly from: string;
  private readonly cardPageUrl: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');
    const pass = config.get<string>('MAIL_PASS');
    const port = parseInt(config.get('MAIL_PORT', '587'), 10);

    this.from = config.get('MAIL_FROM') || `EvercupPoints <${user}>`;
    this.cardPageUrl = `${config.get('APP_URL', 'http://localhost:5173').replace(/\/$/, '')}/card`;

    if (host && user && pass) {
      this.postman = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // 465 = ssl, 587 = starttls
        auth: { user, pass },
      });
    } else {
      this.postman = null;
      this.logger.warn('Email is off. Set MAIL_HOST, MAIL_USER and MAIL_PASS in .env to email member cards.');
    }
  }

  get isOn() {
    return this.postman !== null;
  }

  // returns true if sent, false if not (doesn't throw)
  async sendMemberCard(member: Customer): Promise<boolean> {
    if (!this.postman) return false;

    // skip test addresses so postman runs don't cause bounce emails
    if (isReservedAddress(member.email)) {
      this.logger.log(`Skipped email for ${member.qrCode}: ${member.email} is a reserved test address.`);
      return false;
    }

    try {
      const qrImage = await QRCode.toBuffer(member.qrCode, {
        width: 320,
        margin: 2,
        color: { dark: '#2a1f17', light: '#fbf8f2' },
      });
      const firstName = plain(properName(member.firstName));
      const code = plain(member.qrCode);

      await this.postman.sendMail({
        from: this.from,
        to: member.email,
        subject: `Your EvercupPoints card, ${properName(member.firstName)}`,
        text:
          `Hi ${properName(member.firstName)},\n\n` +
          `Welcome to EvercupPoints. Your member code is ${member.qrCode}.\n` +
          `Show the attached QR at the counter every time you order to earn 1 point for every 10 pesos.\n\n` +
          `Check your points any time at ${this.cardPageUrl} using this email and your member code.\n`,
        html: `
          <div style="background:#f3ede2;padding:28px 12px;font-family:Georgia,serif;color:#2a1f17">
            <div style="max-width:420px;margin:0 auto;background:#fbf8f2;border:1.5px solid #2a1f17">
              <div style="padding:10px 18px;border-bottom:1.5px dashed #c9bca6;font:11px Consolas,monospace;letter-spacing:2px">
                EVERCUPPOINTS &middot; MEMBER CARD
              </div>
              <div style="padding:22px 18px;text-align:center">
                <div style="font-size:24px;margin-bottom:6px">Hi, ${firstName}</div>
                <div style="font:14px Segoe UI,Arial,sans-serif;color:#6e5f52;margin-bottom:16px">
                  Show this at the counter every time you order.
                </div>
                <img src="cid:evercup-card" width="200" height="200" alt="Your member QR code" style="display:block;margin:0 auto 12px" />
                <div style="display:inline-block;border:1px solid #2a1f17;padding:2px 8px;font:13px Consolas,monospace;letter-spacing:1px">${code}</div>
                <div style="font:13px Segoe UI,Arial,sans-serif;color:#6e5f52;margin-top:18px;line-height:1.5">
                  1 point for every &#8369;10. Check your points at
                  <a href="${plain(this.cardPageUrl)}" style="color:#a4471f">${plain(this.cardPageUrl)}</a>
                  with this email and your member code.
                </div>
              </div>
            </div>
          </div>`,
        attachments: [{ filename: `${member.qrCode}.png`, content: qrImage, cid: 'evercup-card' }],
      });

      this.logger.log(`Member card ${member.qrCode} emailed.`);
      return true;
    } catch (err) {
      this.logger.error(`Could not email member card ${member.qrCode}: ${(err as Error).message}`);
      return false;
    }
  }
}
