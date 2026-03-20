package com.revpay.service;

import com.revpay.common.RevPayException;
import com.revpay.dto.pin.PinStatusResponse;
import com.revpay.dto.pin.SetPinRequest;
import com.revpay.dto.pin.VerifyPinRequest;
import com.revpay.entity.User;
import com.revpay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PinService {

    private static final int MAX_PIN_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void setPin(String email, SetPinRequest req) {
        if (!req.getPin().equals(req.getConfirmPin())) {
            throw RevPayException.badRequest("PINs do not match");
        }
        User user = getUser(email);
        if (user.isPinSet()) {
            throw RevPayException.badRequest("PIN already set. Use change-pin to update it.");
        }
        user.setTransactionPin(passwordEncoder.encode(req.getPin()));
        user.setPinSet(true);
        user.setPinAttempts(0);
        user.setPinLength(req.getPin().length());
        userRepository.save(user);
    }

    @Transactional
    public void verifyPin(String email, VerifyPinRequest req) {
        User user = getUser(email);

        if (!user.isPinSet()) {
            throw RevPayException.badRequest("Transaction PIN not set");
        }
        if (user.getPinAttempts() >= MAX_PIN_ATTEMPTS) {
            throw RevPayException.forbidden("Account locked due to too many wrong PIN attempts. Contact support.");
        }
        if (!passwordEncoder.matches(req.getPin(), user.getTransactionPin())) {
            user.setPinAttempts(user.getPinAttempts() + 1);
            userRepository.save(user);
            int remaining = MAX_PIN_ATTEMPTS - user.getPinAttempts();
            throw RevPayException.badRequest("Invalid PIN. " + remaining + " attempt(s) remaining.");
        }
        // Reset attempts on success
        user.setPinAttempts(0);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PinStatusResponse getPinStatus(String email) {
        User user = getUser(email);
        return new PinStatusResponse(user.isPinSet(), user.getPinLength());
    }

    @Transactional
    public void changePin(String email, String oldPin, String newPin, String confirmPin) {
        if (!newPin.equals(confirmPin)) {
            throw RevPayException.badRequest("New PINs do not match");
        }
        User user = getUser(email);
        if (!user.isPinSet()) {
            throw RevPayException.badRequest("No PIN set yet");
        }
        if (!passwordEncoder.matches(oldPin, user.getTransactionPin())) {
            throw RevPayException.badRequest("Current PIN is incorrect");
        }
        if (!newPin.matches("\\d{4}|\\d{6}")) {
            throw RevPayException.badRequest("PIN must be 4 or 6 digits");
        }
        user.setTransactionPin(passwordEncoder.encode(newPin));
        user.setPinAttempts(0);
        user.setPinLength(newPin.length());
        userRepository.save(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> RevPayException.notFound("User not found"));
    }
}
