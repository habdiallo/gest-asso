package com.habdiallo.contribo;

import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;

final class TestRsaKeyMaterial {

    private TestRsaKeyMaterial() {
    }

    static KeyPair generate() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Impossible de générer les clés RSA de test.", exception);
        }
    }
}
