package com.quickship.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.quickship.dto.ReportStatsResponse;
import com.quickship.entity.Parcel;
import com.quickship.entity.ParcelStatus;
import com.quickship.entity.User;
import com.quickship.repository.ParcelRepository;
import com.quickship.repository.UserRepository;
import com.quickship.specification.ParcelSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.awt.Color;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private UserRepository userRepository;

    public ReportStatsResponse getReportStats() {
        List<Parcel> parcels = parcelRepository.findAll();

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIDNIGHT);

        double revenueToday = parcels.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfDay) && p.getCreatedAt().isBefore(endOfDay))
                .mapToDouble(p -> p.getShippingPrice() != null ? p.getShippingPrice() : 0.0)
                .sum();

        double revenueMonth = parcels.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(p -> p.getShippingPrice() != null ? p.getShippingPrice() : 0.0)
                .sum();

        long deliveredCount = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.DELIVERED)
                .count();

        long pendingCount = parcels.stream()
                .filter(p -> p.getStatus() != ParcelStatus.DELIVERED && p.getStatus() != ParcelStatus.RETURNED)
                .count();

        long returnedCount = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.RETURNED)
                .count();

        return ReportStatsResponse.builder()
                .revenueToday(revenueToday)
                .revenueMonth(revenueMonth)
                .deliveredCount(deliveredCount)
                .pendingCount(pendingCount)
                .returnedCount(returnedCount)
                .build();
    }

    public byte[] generatePdfReport(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long driverId,
            Long clientId,
            List<Long> clientIds,
            List<ParcelStatus> statuses,
            String periodLabel
    ) {
        Specification<Parcel> spec = ParcelSpecification.filterParcels(
                startDate, endDate, driverId, clientId, clientIds, statuses
        );

        List<Parcel> parcels = parcelRepository.findAll(spec);

        User driver = null;
        if (driverId != null) {
            driver = userRepository.findById(driverId).orElse(null);
        }

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Brand Colors
            Color primaryColor = new Color(22, 75, 131); // Navy Blue: #164b83
            Color accentColor = new Color(255, 130, 63); // Fox Orange: #ff823f
            Color darkColor = new Color(30, 41, 59);    // Slate 800
            Color lightColor = new Color(248, 250, 252); // Slate 50
            Color borderColor = new Color(226, 232, 240); // Slate 200

            // Header Layout: Table with logo & details
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3f, 2f});

            // Left Cell: Brand Name and Logo
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);

            try (InputStream is = getClass().getResourceAsStream("/quickship_logo.png")) {
                if (is != null) {
                    byte[] logoBytes = is.readAllBytes();
                    Image logoImg = Image.getInstance(logoBytes);
                    logoImg.scaleToFit(60, 60);
                    leftCell.addElement(logoImg);
                }
            } catch (Exception e) {
                // Ignore fallback
            }

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Paragraph brandName = new Paragraph("QuickShip", brandFont);
            brandName.setSpacingBefore(5);
            leftCell.addElement(brandName);

            Font companyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            leftCell.addElement(new Paragraph("QuickShip Logistics S.A.S.\nService d'Administration Centralisé\nParis, France", companyFont));
            headerTable.addCell(leftCell);

            // Right Cell: Report Title and Period
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Font reportTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, accentColor);
            Paragraph reportTitle = new Paragraph("RAPPORT D'ACTIVITÉ", reportTitleFont);
            reportTitle.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(reportTitle);

            Font detailsFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            String docDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            Paragraph details = new Paragraph(
                    "Généré le : " + docDate + "\n" +
                    "Période : " + (periodLabel != null ? periodLabel : "Personnalisée"),
                    detailsFont
            );
            details.setAlignment(Element.ALIGN_RIGHT);
            details.setSpacingBefore(10);
            rightCell.addElement(details);
            headerTable.addCell(rightCell);

            headerTable.setSpacingAfter(10);
            document.add(headerTable);

            // Separator Line
            document.add(new Chunk(new LineSeparator(1f, 100, accentColor, Element.ALIGN_CENTER, -10)));
            document.add(new Paragraph("\n"));

            // Driver Information Section
            if (driver != null) {
                PdfPTable driverTable = new PdfPTable(1);
                driverTable.setWidthPercentage(100);

                PdfPCell driverCell = new PdfPCell();
                driverCell.setBackgroundColor(lightColor);
                driverCell.setBorderColor(borderColor);
                driverCell.setPadding(10);

                Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor);
                driverCell.addElement(new Paragraph("INFORMATIONS LIVREUR", subTitleFont));

                Font driverInfoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
                Paragraph driverInfo = new Paragraph(
                        "Nom Complet : " + driver.getFirstName() + " " + driver.getLastName() + "\n" +
                        "Téléphone : " + (driver.getPhone() != null ? driver.getPhone() : "N/A") + "\n" +
                        "Nombre total de colis assignés : " + parcels.size(),
                        driverInfoFont
                );
                driverInfo.setSpacingBefore(5);
                driverCell.addElement(driverInfo);

                driverTable.addCell(driverCell);
                driverTable.setSpacingAfter(15);
                document.add(driverTable);
            }

            // Table of parcels
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 2.8f, 2.5f, 2f, 2.2f, 1.8f, 1.8f});

            // Table Header
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            String[] headers = {"N°", "Code Colis", "Client", "Tél Dest.", "Ville", "Prix", "Statut"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, tableHeaderFont));
                cell.setBackgroundColor(primaryColor);
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Table Body
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, darkColor);
            int index = 1;
            double totalRevenue = 0.0;
            long deliveredCount = 0;
            long pendingCount = 0;
            long returnedCount = 0;

            for (Parcel parcel : parcels) {
                table.addCell(createCenterCell(String.valueOf(index++), cellFont));
                table.addCell(createLeftCell(parcel.getTrackingId(), cellFont));
                table.addCell(createLeftCell(parcel.getClient().getFirstName() + " " + parcel.getClient().getLastName(), cellFont));
                table.addCell(createCenterCell(parcel.getRecipientPhone(), cellFont));
                table.addCell(createLeftCell(extractCity(parcel.getDeliveryAddress()), cellFont));

                double price = parcel.getShippingPrice() != null ? parcel.getShippingPrice() : 0.0;
                totalRevenue += price;
                table.addCell(createRightCell(String.format("%.2f €", price), cellFont));

                // Translate status to French
                table.addCell(createCenterCell(translateStatus(parcel.getStatus()), cellFont));

                if (parcel.getStatus() == ParcelStatus.DELIVERED) {
                    deliveredCount++;
                } else if (parcel.getStatus() == ParcelStatus.RETURNED) {
                    returnedCount++;
                } else {
                    pendingCount++;
                }
            }

            table.setSpacingAfter(15);
            document.add(table);

            // Summary Section
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{1.5f, 1f});

            PdfPCell summaryTitleCell = new PdfPCell();
            summaryTitleCell.setBorder(Rectangle.NO_BORDER);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor);
            summaryTitleCell.addElement(new Paragraph("RÉSUMÉ CONSOLIDÉ", sectionTitleFont));

            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            Paragraph summaryDetails = new Paragraph(
                    "Nombre total de colis : " + parcels.size() + "\n" +
                    "Total Livré : " + deliveredCount + "\n" +
                    "Total En Attente : " + pendingCount + "\n" +
                    "Total Retourné : " + returnedCount,
                    summaryFont
            );
            summaryDetails.setSpacingBefore(5);
            summaryTitleCell.addElement(summaryDetails);
            summaryTable.addCell(summaryTitleCell);

            PdfPCell summaryValCell = new PdfPCell();
            summaryValCell.setBorder(Rectangle.NO_BORDER);
            summaryValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, accentColor);
            Paragraph totalParagraph = new Paragraph(
                    "\nTOTAL ENCAISSÉ :\n" + String.format("%.2f €", totalRevenue),
                    totalFont
            );
            totalParagraph.setAlignment(Element.ALIGN_RIGHT);
            summaryValCell.addElement(totalParagraph);
            summaryTable.addCell(summaryValCell);

            summaryTable.setSpacingAfter(40);
            document.add(summaryTable);

            // Signatures Section
            PdfPTable signaturesTable = new PdfPTable(2);
            signaturesTable.setWidthPercentage(100);
            signaturesTable.setWidths(new float[]{1f, 1f});

            Font signatureFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkColor);

            PdfPCell adminSignCell = new PdfPCell();
            adminSignCell.setBorder(Rectangle.NO_BORDER);
            adminSignCell.addElement(new Paragraph("Signature Administrateur", signatureFont));
            adminSignCell.addElement(new Paragraph("\n\n________________________", signatureFont));
            signaturesTable.addCell(adminSignCell);

            PdfPCell driverSignCell = new PdfPCell();
            driverSignCell.setBorder(Rectangle.NO_BORDER);
            driverSignCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph driverSignParagraph = new Paragraph("Signature Livreur / Réceptionnaire", signatureFont);
            driverSignParagraph.setAlignment(Element.ALIGN_RIGHT);
            driverSignCell.addElement(driverSignParagraph);
            Paragraph lineParagraph = new Paragraph("\n\n________________________", signatureFont);
            lineParagraph.setAlignment(Element.ALIGN_RIGHT);
            driverSignCell.addElement(lineParagraph);
            signaturesTable.addCell(driverSignCell);

            document.add(signaturesTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private PdfPCell createLeftCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell createCenterCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell createRightCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    private String extractCity(String address) {
        if (address == null) return "N/A";
        String[] parts = address.split(",");
        if (parts.length > 1) {
            return parts[parts.length - 1].trim();
        }
        return address.length() > 20 ? address.substring(0, 17) + "..." : address;
    }

    private String translateStatus(ParcelStatus status) {
        if (status == null) return "N/A";
        switch (status) {
            case CREATED: return "Créé";
            case ACCEPTED: return "Accepté";
            case PICKED_UP: return "Collecté";
            case IN_TRANSIT: return "En transit";
            case ARRIVED_AT_HUB: return "Tri";
            case OUT_FOR_DELIVERY: return "Livraison";
            case DELIVERED: return "Livré";
            case RETURNED: return "Retourné";
            default: return status.name();
        }
    }
}
