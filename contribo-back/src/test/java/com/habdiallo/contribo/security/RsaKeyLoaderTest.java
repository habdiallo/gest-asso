package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;

class RsaKeyLoaderTest {

    @Test
    void missingKeyFailsWithAnExplicitConfigurationError() {
        assertThatThrownBy(() -> RsaKeyLoader.loadPublicKey(
                new DefaultResourceLoader(), "file:/tmp/contribo-missing-public.pem"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("clé RSA");
    }
}
