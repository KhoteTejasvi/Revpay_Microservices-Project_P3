package com.revpay.dto.pin;

public class PinStatusResponse {
    private boolean pinSet;
    private int pinLength; // 0 if not set, 4 or 6 once set

    public PinStatusResponse(boolean pinSet, int pinLength) {
        this.pinSet = pinSet;
        this.pinLength = pinLength;
    }

    public boolean isPinSet() { return pinSet; }
    public void setPinSet(boolean pinSet) { this.pinSet = pinSet; }
    public int getPinLength() { return pinLength; }
    public void setPinLength(int pinLength) { this.pinLength = pinLength; }
}
