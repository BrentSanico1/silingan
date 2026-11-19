package com.silingan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard")
    public ResponseEntity<?> getAdminStats() {
        return ResponseEntity.ok(Map.of(
            "title", "System Administrator Console",
            "barangaysCount", 5,
            "totalUsers", 42,
            "pendingVerifications", 3,
            "status", "All systems operational"
        ));
    }
}
