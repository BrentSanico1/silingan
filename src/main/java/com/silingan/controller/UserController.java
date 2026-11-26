package com.silingan.controller;

import com.silingan.dto.AuthResponse;
import com.silingan.dto.ChangePasswordRequest;
import com.silingan.dto.UpdateProfileRequest;
import com.silingan.dto.UserProfileResponse;
import com.silingan.model.User;
import com.silingan.security.JwtUtil;
import com.silingan.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Profile endpoints for the currently logged-in user. All routes use "/me" and resolve
 * the account from the authenticated JWT; there is deliberately no endpoint that takes
 * another user's id, so one user cannot view or modify another user's profile.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(UserProfileResponse.from(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(Authentication authentication,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(UserProfileResponse.from(user));
    }

    /**
     * Changes the password. Sessions holding the old token are revoked; the caller gets a
     * fresh token in the response so this session stays signed in.
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication authentication,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        User user = userService.changePassword(authentication.getName(), request);
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully. Other sessions have been signed out.",
                "auth", new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name())
        ));
    }
}
