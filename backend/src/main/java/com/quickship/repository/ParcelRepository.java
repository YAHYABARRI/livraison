package com.quickship.repository;

import com.quickship.entity.Parcel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParcelRepository extends JpaRepository<Parcel, Long>, JpaSpecificationExecutor<Parcel> {
    
    List<Parcel> findByClientIdOrderByCreatedAtDesc(Long clientId);
    
    List<Parcel> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    
    Optional<Parcel> findByTrackingId(String trackingId);
    
    Optional<Parcel> findByTrackingNumber(String trackingNumber);
    
    List<Parcel> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Parcel p WHERE p.client.id = :clientId AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.trackingId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.deliveryAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Parcel> searchClientParcels(@Param("clientId") Long clientId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Parcel p WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(p.trackingId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.recipientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.client.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.client.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.deliveryAddress) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Parcel> searchAllParcels(@Param("search") String search, Pageable pageable);
}
