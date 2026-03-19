package com.revpay.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    /** unitPrice × quantity */
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal lineTotal;

    // ── Relationships ────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    // ── Lifecycle ─────────────────────────────────────────────

    @PrePersist
    @PreUpdate
    void computeLineTotal() {
        if (unitPrice != null && quantity != null) {
            lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}