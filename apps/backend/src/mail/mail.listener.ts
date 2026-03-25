import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('user.forgot-password', { async: true })
  async handleForgotPasswordEvent(payload: { email: string; html: string }) {
    this.logger.log(`[Event] Sending forgot password email to ${payload.email}`);
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Password Reset - ReLive',
        html: payload.html,
      });
    } catch (e) {
      this.logger.error('Failed to send forgot password email in background', e);
    }
  }

  @OnEvent('user.registered', { async: true })
  async handleUserRegisteredEvent(payload: { email: string; html: string }) {
    this.logger.log(`[Event] Sending activation email to ${payload.email}`);
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Activate your account - ReLive',
        html: payload.html,
      });
    } catch (e) {
      this.logger.error('Failed to send activation email in background', e);
    }
  }

  @OnEvent('user.email-change-request', { async: true })
  async handleEmailChangeRequestEvent(payload: { email: string; html: string }) {
    this.logger.log(`[Event] Sending email change verification to ${payload.email}`);
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Verify your new email address – ReLive',
        html: payload.html,
      });
    } catch (e) {
      this.logger.error('Failed to send email change verification in background', e);
    }
  }

  @OnEvent('user.email-changed-alert', { async: true })
  async handleEmailChangedAlertEvent(payload: { email: string; html: string }) {
    this.logger.log(`[Event] Sending security alert to old email ${payload.email}`);
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Security Alert: Email address changed – ReLive',
        html: payload.html,
      });
    } catch (e) {
      this.logger.error('Failed to send security alert in background', e);
    }
  }
}
