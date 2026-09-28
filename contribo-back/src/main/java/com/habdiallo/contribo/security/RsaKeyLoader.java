package com.habdiallo.contribo.security;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

final class RsaKeyLoader {

    private RsaKeyLoader() {
    }

    static RSAPublicKey loadPublicKey(ResourceLoader resourceLoader, String location) {
        byte[] encoded = readPem(resourceLoader, location, "PUBLIC KEY");
        try {
            return (RSAPublicKey) rsaKeyFactory().generatePublic(new X509EncodedKeySpec(encoded));
        } catch (InvalidKeySpecException exception) {
            throw invalidKey(location, exception);
        }
    }

    static RSAPrivateKey loadPrivateKey(ResourceLoader resourceLoader, String location) {
        byte[] encoded = readPem(resourceLoader, location, "PRIVATE KEY");
        try {
            return (RSAPrivateKey) rsaKeyFactory().generatePrivate(new PKCS8EncodedKeySpec(encoded));
        } catch (InvalidKeySpecException exception) {
            throw invalidKey(location, exception);
        }
    }

    private static byte[] readPem(ResourceLoader resourceLoader, String location, String type) {
        if (location == null || location.isBlank()) {
            throw new IllegalStateException("La ressource RSA " + type + " est absente.");
        }
        Resource resource = resourceLoader.getResource(location);
        try (InputStream inputStream = resource.getInputStream()) {
            String pem = new String(inputStream.readAllBytes(), StandardCharsets.US_ASCII);
            String encoded = pem
                    .replace("-----BEGIN " + type + "-----", "")
                    .replace("-----END " + type + "-----", "")
                    .replaceAll("\\s", "");
            return Base64.getDecoder().decode(encoded);
        } catch (IOException | IllegalArgumentException exception) {
            throw invalidKey(location, exception);
        }
    }

    private static KeyFactory rsaKeyFactory() {
        try {
            return KeyFactory.getInstance("RSA");
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("L'algorithme RSA est indisponible.", exception);
        }
    }

    private static IllegalStateException invalidKey(String location, Exception cause) {
        return new IllegalStateException("La clé RSA est absente ou invalide: " + location, cause);
    }
}
