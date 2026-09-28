package com.habdiallo.contribo;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.util.UUID;
import java.util.Base64;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

abstract class RsaIntegrationTestSupport {

    private static final Path KEY_DIRECTORY = createKeyDirectory();

    static {
        KeyPair keyPair = TestRsaKeyMaterial.generate();
        writePem(KEY_DIRECTORY.resolve("public.pem"), "PUBLIC KEY", keyPair.getPublic().getEncoded());
        writePem(KEY_DIRECTORY.resolve("private.pem"), "PRIVATE KEY", keyPair.getPrivate().getEncoded());
    }

    @DynamicPropertySource
    static void rsaProperties(DynamicPropertyRegistry registry) {
        registry.add("security.rsa.public-key", () -> "file:" + KEY_DIRECTORY.resolve("public.pem"));
        registry.add("security.rsa.private-key", () -> "file:" + KEY_DIRECTORY.resolve("private.pem"));
    }

    static String tokenSignedByAnotherKey(UUID userId) {
        KeyPair otherKeys = TestRsaKeyMaterial.generate();
        return new com.habdiallo.contribo.security.JwtTokenService(
                (java.security.interfaces.RSAPublicKey) otherKeys.getPublic(),
                (java.security.interfaces.RSAPrivateKey) otherKeys.getPrivate(), 3600)
                .issue(userId);
    }

    private static Path createKeyDirectory() {
        try {
            return Files.createTempDirectory("contribo-test-rsa-");
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de créer les fichiers RSA de test.", exception);
        }
    }

    private static void writePem(Path path, String type, byte[] encoded) {
        String body = Base64.getMimeEncoder(64, "\n".getBytes(StandardCharsets.US_ASCII)).encodeToString(encoded);
        try {
            Files.writeString(path,
                    "-----BEGIN " + type + "-----\n" + body + "\n-----END " + type + "-----\n",
                    StandardCharsets.US_ASCII);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible d'écrire les clés RSA de test.", exception);
        }
    }
}
