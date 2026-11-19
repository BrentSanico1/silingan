package com.silingan.repository;

import com.silingan.model.Barangay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BarangayRepository extends JpaRepository<Barangay, Long> {
    Optional<Barangay> findByName(String name);
}
