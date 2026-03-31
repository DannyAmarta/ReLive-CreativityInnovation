"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const mailer_1 = require("@nestjs-modules/mailer");
let MailListener = MailListener_1 = class MailListener {
    mailerService;
    logger = new common_1.Logger(MailListener_1.name);
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async handleForgotPasswordEvent(payload) {
        this.logger.log(`[Event] Sending forgot password email to ${payload.email}`);
        try {
            await this.mailerService.sendMail({
                to: payload.email,
                subject: 'Password Reset - ReLive',
                html: payload.html,
            });
        }
        catch (e) {
            this.logger.error('Failed to send forgot password email in background', e);
        }
    }
    async handleUserRegisteredEvent(payload) {
        this.logger.log(`[Event] Sending activation email to ${payload.email}`);
        try {
            await this.mailerService.sendMail({
                to: payload.email,
                subject: 'Activate your account - ReLive',
                html: payload.html,
            });
        }
        catch (e) {
            this.logger.error('Failed to send activation email in background', e);
        }
    }
    async handleEmailChangeRequestEvent(payload) {
        this.logger.log(`[Event] Sending email change verification to ${payload.email}`);
        try {
            await this.mailerService.sendMail({
                to: payload.email,
                subject: 'Verify your new email address – ReLive',
                html: payload.html,
            });
        }
        catch (e) {
            this.logger.error('Failed to send email change verification in background', e);
        }
    }
    async handleEmailChangedAlertEvent(payload) {
        this.logger.log(`[Event] Sending security alert to old email ${payload.email}`);
        try {
            await this.mailerService.sendMail({
                to: payload.email,
                subject: 'Security Alert: Email address changed – ReLive',
                html: payload.html,
            });
        }
        catch (e) {
            this.logger.error('Failed to send security alert in background', e);
        }
    }
};
exports.MailListener = MailListener;
__decorate([
    (0, event_emitter_1.OnEvent)('user.forgot-password', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailListener.prototype, "handleForgotPasswordEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.registered', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailListener.prototype, "handleUserRegisteredEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.email-change-request', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailListener.prototype, "handleEmailChangeRequestEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.email-changed-alert', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailListener.prototype, "handleEmailChangedAlertEvent", null);
exports.MailListener = MailListener = MailListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailListener);
//# sourceMappingURL=mail.listener.js.map