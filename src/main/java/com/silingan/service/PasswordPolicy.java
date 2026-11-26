package com.silingan.service;

import com.silingan.exception.ApiException;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * One password rule set used by registration, change password, and reset password:
 * 8 to 72 characters (BCrypt ignores anything past 72 bytes), with at least one letter,
 * one digit, and no leading or trailing spaces.
 */
@Component
public class PasswordPolicy {

    public static final String RULES = "Password must be 8-72 characters and contain at least one letter and one number.";

    public void validate(String password) {
        if (password == null || password.isEmpty()) {
            throw ApiException.badRequest("Password is required.");
        }
        if (!password.equals(password.strip())) {
            throw ApiException.badRequest("Password must not start or end with a space.");
        }
        int bytes = password.getBytes(StandardCharsets.UTF_8).length;
        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (password.length() < 8 || bytes > 72 || !hasLetter || !hasDigit) {
            throw ApiException.badRequest(RULES);
        }
    }

    public void validateNewWithConfirmation(String newPassword, String confirmPassword) {
        validate(newPassword);
        if (!newPassword.equals(confirmPassword)) {
            throw ApiException.badRequest("New password and confirmation do not match.");
        }
    }
}
