package com.revpay.service;

import com.revpay.common.RevPayException;
import com.revpay.dto.payment.PaymentMethodRequest;
import com.revpay.dto.payment.PaymentMethodResponse;
import com.revpay.entity.PaymentMethod;
import com.revpay.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getMyPaymentMethods(String email) {
        return paymentMethodRepository.findByUserEmail(email)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PaymentMethodResponse addPaymentMethod(String email, PaymentMethodRequest req) {
        PaymentMethod pm = new PaymentMethod();
        pm.setUserEmail(email);
        pm.setType(req.getType());
        pm.setMaskedIdentifier(req.getMaskedIdentifier());
        pm.setProvider(req.getProvider());
        pm.setExpiryMonth(req.getExpiryMonth());
        pm.setExpiryYear(req.getExpiryYear());
        pm.setDefault(req.isDefault());
        pm.setVerified(true);

        paymentMethodRepository.save(pm);
        return toResponse(pm);
    }

    @Transactional
    public void deletePaymentMethod(String email, Long id) {
        PaymentMethod pm = paymentMethodRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> RevPayException.notFound("Payment method not found"));
        paymentMethodRepository.delete(pm);
    }

    public PaymentMethodResponse toResponse(PaymentMethod pm) {
        PaymentMethodResponse r = new PaymentMethodResponse();
        r.setId(pm.getId());
        r.setType(pm.getType());
        r.setMaskedIdentifier(pm.getMaskedIdentifier());
        r.setProvider(pm.getProvider());
        r.setExpiryMonth(pm.getExpiryMonth());
        r.setExpiryYear(pm.getExpiryYear());
        r.setDefault(pm.isDefault());
        r.setVerified(pm.isVerified());
        r.setCreatedAt(pm.getCreatedAt());
        return r;
    }
}