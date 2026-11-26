package com.silingan.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends password reset emails over SMTP. When no SMTP server is configured
 * (SPRING_MAIL_HOST unset), the link is written to the server log so the flow can still
 * be exercised on a developer machine.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    public MailService(ObjectProvider<JavaMailSender> mailSender, @Value("${app.mail-from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendPasswordResetLink(String to, String name, String link, long expiryMinutes) {
        String body = """
                Hi %s,

                We received a request to reset the password for your Silingan account.
                Open the link below to choose a new password. The link works once and expires in %d minutes.

                %s

                If you did not request this, you can ignore this email. Your password will not change.

                - Silingan
                """.formatted(name == null ? "there" : name, expiryMinutes, link);

        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            log.warn("SMTP is not configured (set SPRING_MAIL_HOST). Password reset link for {}: {}", to, link);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("Reset your Silingan password");
        message.setText(body);
        try {
            sender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (MailException ex) {
            // Do not reveal delivery problems to the requester (it would leak whether the
            // account exists); record them for the operator instead.
            log.error("Failed to send password reset email to {}", to, ex);
        }
    }
}
