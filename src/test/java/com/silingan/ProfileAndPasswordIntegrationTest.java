package com.silingan;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.silingan.repository.PasswordResetTokenRepository;
import com.silingan.service.MailService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end API tests for Increment 2 (profile, change password, forgot/reset password)
 * plus regression checks that Increment 1 (register, login, role-protected routes) still
 * works. Runs against the in-memory H2 profile; email sending is replaced by a mock so the
 * reset link can be captured.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class ProfileAndPasswordIntegrationTest {

    private static final String PASSWORD = "Password123";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired PasswordResetTokenRepository tokenRepository;
    @MockBean MailService mailService;

    // ---------- helpers ----------

    private String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@test.com";
    }

    private ResultActions post(String url, Object body, String token) throws Exception {
        var req = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(url)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    private ResultActions put(String url, Object body, String token) throws Exception {
        var req = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put(url)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    private ResultActions getMe(String token) throws Exception {
        var req = get("/api/users/me");
        if (token != null) req.header("Authorization", "Bearer " + token);
        return mvc.perform(req);
    }

    private String register(String email, String role) throws Exception {
        String body = post("/api/auth/register",
                Map.of("name", "Juan dela Cruz", "email", email, "password", PASSWORD, "role", role), null)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    private ResultActions login(String email, String password) throws Exception {
        return post("/api/auth/login", Map.of("email", email, "password", password), null);
    }

    private String requestResetAndCaptureToken(String email) throws Exception {
        post("/api/auth/forgot-password", Map.of("email", email), null).andExpect(status().isOk());
        ArgumentCaptor<String> link = ArgumentCaptor.forClass(String.class);
        verify(mailService).sendPasswordResetLink(eq(email), anyString(), link.capture(), anyLong());
        return link.getValue().substring(link.getValue().indexOf("token=") + 6);
    }

    // ---------- Increment 1 regression ----------

    @Test
    void increment1_registerLoginAndRoleRestrictionsStillWork() throws Exception {
        String email = uniqueEmail();
        String token = register(email, "RESIDENT");
        login(email, PASSWORD).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("RESIDENT"));
        login(email, "WrongPass1").andExpect(status().isUnauthorized());
        post("/api/auth/register", Map.of("name", "Dup", "email", email, "password", PASSWORD), null)
                .andExpect(status().isConflict());

        mvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        String adminToken = register(uniqueEmail(), "ADMIN");
        mvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void registrationRejectsWeakPassword() throws Exception {
        post("/api/auth/register", Map.of("name", "Weak", "email", uniqueEmail(), "password", "short"), null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("8-72 characters")));
    }

    // ---------- Profile ----------

    @Test
    void profileCanBeViewedAndEditedAndIsPersisted() throws Exception {
        String email = uniqueEmail();
        String token = register(email, "RESIDENT");

        getMe(token).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.password").doesNotExist());

        put("/api/users/me", Map.of("name", "Maria Santos", "contactNumber", "0917 123 4567",
                "address", "Purok 3, Barangay Lahug", "bio", "Community volunteer"), token)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Maria Santos"))
                .andExpect(jsonPath("$.contactNumber").value("09171234567"));

        getMe(token).andExpect(jsonPath("$.name").value("Maria Santos"))
                .andExpect(jsonPath("$.address").value("Purok 3, Barangay Lahug"))
                .andExpect(jsonPath("$.bio").value("Community volunteer"));
    }

    @Test
    void profileUpdateValidatesInput() throws Exception {
        String token = register(uniqueEmail(), "RESIDENT");
        put("/api/users/me", Map.of("name", ""), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists());
        put("/api/users/me", Map.of("name", "Valid Name", "contactNumber", "12345"), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.contactNumber").exists());
        put("/api/users/me", Map.of("name", "Valid Name", "bio", "<script>alert(1)</script>"), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.bio").exists());
    }

    @Test
    void profileCannotBeChangedWithoutAuthenticationOrForAnotherUser() throws Exception {
        put("/api/users/me", Map.of("name", "Hacker"), null).andExpect(status().isUnauthorized());
        getMe(null).andExpect(status().isUnauthorized());
        getMe("not-a-real-token").andExpect(status().isUnauthorized());

        String victimEmail = uniqueEmail();
        String victimToken = register(victimEmail, "RESIDENT");
        String attackerToken = register(uniqueEmail(), "RESIDENT");

        // Even with a role/email/id smuggled in the body, the update only applies to the caller.
        put("/api/users/me", Map.of("name", "Attacker", "email", victimEmail, "role", "ADMIN", "id", 1), attackerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("RESIDENT"));
        getMe(victimToken).andExpect(jsonPath("$.name").value("Juan dela Cruz"));
        // There is no route that addresses another user's profile by id.
        put("/api/users/1", Map.of("name", "Attacker"), attackerToken).andExpect(status().is4xxClientError());
    }

    // ---------- Change password ----------

    @Test
    void changePasswordRequiresCurrentPasswordAndValidConfirmation() throws Exception {
        String token = register(uniqueEmail(), "RESIDENT");
        put("/api/users/me/password", Map.of("currentPassword", "Wrong12345", "newPassword", "NewPass456",
                "confirmPassword", "NewPass456"), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Current password is incorrect."));
        put("/api/users/me/password", Map.of("currentPassword", PASSWORD, "newPassword", "NewPass456",
                "confirmPassword", "Different789"), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("New password and confirmation do not match."));
        put("/api/users/me/password", Map.of("currentPassword", PASSWORD, "newPassword", "nodigits",
                "confirmPassword", "nodigits"), token)
                .andExpect(status().isBadRequest());
        put("/api/users/me/password", Map.of("currentPassword", PASSWORD, "newPassword", PASSWORD,
                "confirmPassword", PASSWORD), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("New password must be different from your current password."));
    }

    @Test
    void changePasswordInvalidatesOldPasswordAndOldSessions() throws Exception {
        String email = uniqueEmail();
        String oldToken = register(email, "OFFICIAL");

        String body = put("/api/users/me/password", Map.of("currentPassword", PASSWORD, "newPassword", "NewPass456",
                "confirmPassword", "NewPass456"), oldToken)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String newToken = json.readTree(body).at("/auth/token").asText();

        login(email, PASSWORD).andExpect(status().isUnauthorized());
        login(email, "NewPass456").andExpect(status().isOk());
        getMe(oldToken).andExpect(status().isUnauthorized());
        getMe(newToken).andExpect(status().isOk());
    }

    // ---------- Forgot / reset password ----------

    @Test
    void forgotPasswordDoesNotRevealWhetherEmailExists() throws Exception {
        String email = uniqueEmail();
        register(email, "RESIDENT");
        String known = post("/api/auth/forgot-password", Map.of("email", email), null)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String unknownEmail = "nobody-" + UUID.randomUUID() + "@test.com";
        String unknown = post("/api/auth/forgot-password", Map.of("email", unknownEmail), null)
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat(known).isEqualTo(unknown);
        verify(mailService).sendPasswordResetLink(eq(email), anyString(), anyString(), anyLong());
        verify(mailService, never()).sendPasswordResetLink(eq(unknownEmail), anyString(), anyString(), anyLong());

        post("/api/auth/forgot-password", Map.of("email", "not-an-email"), null).andExpect(status().isBadRequest());
    }

    @Test
    void resetPasswordWithValidTokenWorksOnceAndRevokesSessions() throws Exception {
        String email = uniqueEmail();
        String oldSession = register(email, "RESIDENT");
        String token = requestResetAndCaptureToken(email);

        assertThat(token).hasSizeGreaterThanOrEqualTo(43);
        // Only the hash is stored, never the raw token.
        assertThat(tokenRepository.findAll()).noneMatch(t -> t.getTokenHash().equals(token));

        mvc.perform(get("/api/auth/reset-password/validate").param("token", token)).andExpect(status().isOk());

        post("/api/auth/reset-password", Map.of("token", token, "newPassword", "Mismatch1",
                "confirmPassword", "Mismatch2"), null).andExpect(status().isBadRequest());
        // A failed attempt must not burn the token.
        post("/api/auth/reset-password", Map.of("token", token, "newPassword", "ResetPass789",
                "confirmPassword", "ResetPass789"), null).andExpect(status().isOk());

        login(email, PASSWORD).andExpect(status().isUnauthorized());
        login(email, "ResetPass789").andExpect(status().isOk());
        getMe(oldSession).andExpect(status().isUnauthorized());

        // Single use.
        post("/api/auth/reset-password", Map.of("token", token, "newPassword", "Another123",
                "confirmPassword", "Another123"), null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("invalid or has expired")));
        mvc.perform(get("/api/auth/reset-password/validate").param("token", token)).andExpect(status().isBadRequest());
    }

    @Test
    void expiredOrUnknownResetTokenIsRejected() throws Exception {
        String email = uniqueEmail();
        register(email, "RESIDENT");
        String token = requestResetAndCaptureToken(email);

        tokenRepository.findAll().forEach(t -> {
            t.setExpiresAt(Instant.now().minusSeconds(1));
            tokenRepository.save(t);
        });
        post("/api/auth/reset-password", Map.of("token", token, "newPassword", "ResetPass789",
                "confirmPassword", "ResetPass789"), null).andExpect(status().isBadRequest());
        post("/api/auth/reset-password", Map.of("token", "made-up-token", "newPassword", "ResetPass789",
                "confirmPassword", "ResetPass789"), null).andExpect(status().isBadRequest());
        login(email, PASSWORD).andExpect(status().isOk());
    }
}
