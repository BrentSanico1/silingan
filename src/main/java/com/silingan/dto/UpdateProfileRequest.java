package com.silingan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Editable profile fields. Email and role are intentionally absent: email is the login
 * identity and roles are assigned by a system administrator (FR-054), so neither can be
 * changed through this endpoint.
 */
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 100, message = "Full name must be 2 to 100 characters.")
    @Pattern(regexp = "^[\\p{L} .'-]+$", message = "Full name may only contain letters, spaces, periods, apostrophes, and hyphens.")
    private String name;

    @Pattern(regexp = "^$|^(\\+639|09)\\d{9}$", message = "Contact number must be a valid PH mobile number (09XXXXXXXXX or +639XXXXXXXXX).")
    private String contactNumber;

    @Size(max = 255, message = "Address must be at most 255 characters.")
    @Pattern(regexp = "^[^<>]*$", message = "Address must not contain < or > characters.")
    private String address;

    @Size(max = 500, message = "Bio must be at most 500 characters.")
    @Pattern(regexp = "^[^<>]*$", message = "Bio must not contain < or > characters.")
    private String bio;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name == null ? null : name.trim();
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber == null ? null : contactNumber.replaceAll("[\\s-]", "");
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address == null ? null : address.trim();
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio == null ? null : bio.trim();
    }
}
