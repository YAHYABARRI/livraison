package com.quickship.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParcelRequest {

    @NotBlank(message = "Le nom du destinataire est requis")
    private String recipientName;

    @NotBlank(message = "Le téléphone du destinataire est requis")
    private String recipientPhone;

    @NotBlank(message = "L'adresse de collecte est requise")
    private String pickupAddress;

    @NotBlank(message = "L'adresse de livraison est requise")
    private String deliveryAddress;

    private String description;

    @NotNull(message = "Le poids du colis est requis")
    @Positive(message = "Le poids doit être supérieur à zéro")
    private Double weight;

    private LocalDateTime estimatedDelivery;
}
