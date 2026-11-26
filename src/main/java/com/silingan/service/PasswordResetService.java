package com.silingan.service;

import com.silingan.dto.ResetPasswordRequest;
import com.silingan.exception.ApiException;
import com.silingan.model.PasswordResetToken;
import com.silingan.model.User;
import com.silingan.repository.PasswordResetTokenRepository;
import com.silingan.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Forgot-password flow:
 * 1. requestReset: issue a random 256-bit token, store only its SHA-256 hash with a
 *    30-minute expiry, and email the user a link containing the raw token.
 * 2. validate: tell the reset page whether a token is still usable.
 * 3. resetPassword: check the token is unexpired and unused, set the new BCrypt hash,
 *    mark the token used, and revoke existing sessions.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String INVALID_TOKEN = "This reset link is invalid or has expired. Please request a new one.";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final UserService userService;
    private final PasswordPolicy passwordPolicy;
    private final MailService mailService;
    private final String frontendUrl;
    private final Duration expiry;
    private final Duration resendCooldown;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                UserService userService,
                                PasswordPolicy passwordPolicy,
                                MailService mailService,
                                @Value("${app.frontend-url}") String frontendUrl,
                                @Value("${app.password-reset.expiry-minutes}") long expiryMinutes,
                                @Value("${app.password-reset.resend-cooldown-seconds}") long cooldownSeconds) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.userService = userService;
        this.passwordPolicy = passwordPolicy;
        this.mailService = mailService;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.expiry = Duration.ofMinutes(expiryMinutes);
        this.resendCooldown = Duration.ofSeconds(cooldownSeconds);
    }

    /**
     * Always completes silently so the response never reveals whether an email is
     * registered (prevents account enumeration).
     */
    @Transactional
    public void requestReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.info("Password reset requested for unknown email");
            return;
        }
        User user = userOpt.get();
        Instant now = Instant.now();

        Optional<PasswordResetToken> latest = tokenRepository.findTopByUserOrderByCreatedAtDesc(user);
        if (latest.isPresent() && latest.get().getCreatedAt().plus(resendCooldown).isAfter(now)) {
            log.info("Password reset for user {} throttled (cooldown)", user.getId());
            return;
        }

        tokenRepository.invalidateAllForUser(user, now);
        String rawToken = newRawToken();
        tokenRepository.save(new PasswordResetToken(hash(rawToken), user, now, now.plus(expiry)));

        String link = frontendUrl + "/reset-password?token=" + rawToken;
        mailService.sendPasswordResetLink(user.getEmail(), user.getName(), link, expiry.toMinutes());
    }

    public long getExpiryMinutes() {
        return expiry.toMinutes();
    }

    @Transactional(readOnly = true)
    public boolean isTokenUsable(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        return tokenRepository.findByTokenHash(hash(rawToken.trim()))
                .map(t -> t.isUsable(Instant.now()))
                .orElse(false);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Instant now = Instant.now();
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(request.getToken()))
                .filter(t -> t.isUsable(now))
                .orElseThrow(() -> ApiException.badRequest(INVALID_TOKEN));

        passwordPolicy.validateNewWithConfirmation(request.getNewPassword(), request.getConfirmPassword());

        User user = token.getUser();
        userService.applyNewPassword(user, request.getNewPassword());
        userRepository.save(user);

        token.setUsedAt(now);
        tokenRepository.save(token);
        tokenRepository.invalidateAllForUser(user, now);
        log.info("Password reset completed for user {}", user.getId());
    }

    private static String newRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
