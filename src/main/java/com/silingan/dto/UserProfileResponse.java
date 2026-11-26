package com.silingan.dto;

import com.silingan.model.User;

import java.time.Instant;

/** What the profile page shows. Never includes the password hash or token version. */
public record UserProfileResponse(
        Long id,
        String email,
        String name,
        String role,
        String contactNumber,
        String address,
        String bio,
        Long barangayId,
        String barangayName,
        Instant updatedAt,
        Instant passwordChangedAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getContactNumber(),
                user.getAddress(),
                user.getBio(),
                user.getBarangay() != null ? user.getBarangay().getId() : null,
                user.getBarangay() != null ? user.getBarangay().getName() : null,
                user.getUpdatedAt(),
                user.getPasswordChangedAt()
        );
    }
}
