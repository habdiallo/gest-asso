package com.habdiallo.contribo.security;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import java.time.Duration;

@Configuration
@EnableConfigurationProperties(RsaKeyProperties.class)
public class RsaSecurityConfiguration {

    @Bean
    RSAPublicKey rsaPublicKey(RsaKeyProperties properties, ResourceLoader resourceLoader) {
        return RsaKeyLoader.loadPublicKey(resourceLoader, properties.getPublicKey());
    }

    @Bean
    RSAPrivateKey rsaPrivateKey(RsaKeyProperties properties, ResourceLoader resourceLoader) {
        return RsaKeyLoader.loadPrivateKey(resourceLoader, properties.getPrivateKey());
    }

    @Bean
    JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
        if (!publicKey.getModulus().equals(privateKey.getModulus())) {
            throw new IllegalStateException("Les clés RSA publique et privée ne correspondent pas.");
        }
        RSAKey rsaKey = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
        return new NimbusJwtEncoder(new ImmutableJWKSet<SecurityContext>(new JWKSet(rsaKey)));
    }

    @Bean
    JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withPublicKey(publicKey).build();
        JwtTimestampValidator timestampValidator = new JwtTimestampValidator(Duration.ZERO);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestampValidator));
        return decoder;
    }
}
