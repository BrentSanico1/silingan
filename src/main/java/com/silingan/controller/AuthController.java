package com.silingan.controller;

import com.silingan.dto.AuthResponse;
import com.silingan.dto.ForgotPasswordRequest;
import com.silingan.dto.LoginRequest;
import com.silingan.dto.RegisterRequest;
import com.silingan.dto.ResetPasswordRequest;
import com.silingan.exception.ApiException;
import com.silingan.model.Role;
import com.silingan.model.User;
import com.silingan.repository.UserRepository;
import com.silingan.security.JwtUtil;
import com.silingan.service.PasswordPolicy;
import com.silingan.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ERROR = "error";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordPolicy passwordPolicy;
    private final PasswordResetService passwordResetService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                          PasswordPolicy passwordPolicy, PasswordResetService passwordResetService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.passwordPolicy = passwordPolicy;
        this.passwordResetService = passwordResetService;
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "Silingan API is running"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty() ||
            request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(ERROR, "Name, email, and password are required."));
        }
        passwordPolicy.validate(request.getPassword());

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(ERROR, "An account with this email already exists."));
        }

        Role assignedRole = Role.RESIDENT;
        if (request.getRole() != null) {
            try {
                assignedRole = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                assignedRole = Role.RESIDENT;
            }
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name())
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of(ERROR, "Email and password are required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(ERROR, "Invalid email or password."));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(ERROR, "Invalid email or password."));
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(
            new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name())
        );
    }

    /** Step 1 of forgot password. The reply is identical whether or not the email exists. */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(Map.of("message",
                "If an account exists for that email, a password reset link has been sent. The link expires in "
                        + passwordResetService.getExpiryMinutes() + " minutes."));
    }

    /** Lets the reset page check a link before showing the form. */
    @GetMapping("/reset-password/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam(name = "token", required = false) String token) {
        if (!passwordResetService.isTokenUsable(token)) {
            throw ApiException.badRequest("This reset link is invalid or has expired. Please request a new one.");
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }

    /** Step 2 of forgot password: redeem the single-use token and set a new password. */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Your password has been reset. You can now log in with your new password."));
    }
}
