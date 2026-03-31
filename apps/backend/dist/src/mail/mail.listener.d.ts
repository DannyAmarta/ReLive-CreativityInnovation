import { MailerService } from '@nestjs-modules/mailer';
export declare class MailListener {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    handleForgotPasswordEvent(payload: {
        email: string;
        html: string;
    }): Promise<void>;
    handleUserRegisteredEvent(payload: {
        email: string;
        html: string;
    }): Promise<void>;
    handleEmailChangeRequestEvent(payload: {
        email: string;
        html: string;
    }): Promise<void>;
    handleEmailChangedAlertEvent(payload: {
        email: string;
        html: string;
    }): Promise<void>;
}
