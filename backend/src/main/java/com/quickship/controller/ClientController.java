package com.quickship.controller;

import com.quickship.dto.ParcelRequest;
import com.quickship.dto.ParcelResponse;
import com.quickship.security.UserPrincipal;
import com.quickship.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcels")
public class ClientController {

    @Autowired
    private ParcelService parcelService;

    @Autowired
    private com.quickship.service.InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ParcelResponse> createParcel(
            @Valid @RequestBody ParcelRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(parcelService.createParcel(request, userPrincipal.getEmail()));
    }

    @GetMapping
    public ResponseEntity<?> getMyParcels(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (page == null || size == null) {
            return ResponseEntity.ok(parcelService.getClientParcels(userPrincipal.getEmail()));
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("createdAt").descending());
        return ResponseEntity.ok(parcelService.getClientParcelsPaginated(userPrincipal.getEmail(), search, pageable));
    }

    @GetMapping("/{trackingId}")
    public ResponseEntity<ParcelResponse> getParcelByTrackingId(
            @PathVariable String trackingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(parcelService.getParcelByTrackingId(trackingId, userPrincipal.getEmail()));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<ParcelResponse> getParcelByTrackingIdPublic(
            @PathVariable String trackingId) {
        return ResponseEntity.ok(parcelService.getParcelByTrackingIdPublic(trackingId));
    }

    @GetMapping("/{trackingId}/invoice")
    public ResponseEntity<byte[]> getInvoice(
            @PathVariable String trackingId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        // Enforces ownership security checks (throws exception if unauthorized)
        com.quickship.entity.Parcel parcel = parcelService.getParcelEntityByTrackingId(trackingId, userPrincipal.getEmail());
        byte[] pdfBytes = invoiceService.generateInvoicePdf(parcel);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + trackingId + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
