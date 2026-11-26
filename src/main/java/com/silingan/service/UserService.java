package com.silingan.service;

import com.silingan.dto.ChangePasswordRequest;
import com.silingan.dto.UpdateProfileRequest;
import com.silingan.exception.ApiException;
import com.silingan.model.User;
import com.silingan.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Profile and password operations for the signed-in user. Every method takes the email
 * from the verified JWT, never a user id from the request, so a user can only ever read
 * or change their own account.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicy = passwordPolicy;
    }

    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Account not found."));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = getByEmail(email);
        user.setName(request.getName());
        user.setContactNumber(blankToNull(request.getContactNumber()));
        user.setAddress(blankToNull(request.getAddress()));
        user.setBio(blankToNull(request.getBio()));
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    /**
     * Verifies the current password, stores the BCrypt hash of the new one, and bumps the
     * token version so every JWT issued under the old password is rejected.
     */
    @Transactional
    public User changePassword(String email, ChangePasswordRequest request) {
        User user = getByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect.");
        }
        passwordPolicy.validateNewWithConfirmation(request.getNewPassword(), request.getConfirmPassword());
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw ApiException.badRequest("New password must be different from your current password.");
        }
        applyNewPassword(user, request.getNewPassword());
        return userRepository.save(user);
    }

    /** Shared by change password and reset password. */
    void applyNewPassword(User user, String rawPassword) {
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        user.setPasswordChangedAt(Instant.now());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
