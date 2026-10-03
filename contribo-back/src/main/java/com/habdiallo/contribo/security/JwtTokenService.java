package com.habdiallo.contribo.security;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.proc.SecurityContext;

@Service
public class JwtTokenService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final long expirationSeconds;

    @Autowired
    public JwtTokenService(
            JwtEncoder encoder,
            JwtDecoder decoder,
            @Value("${security.jwt.expiration-seconds}") long expirationSeconds) {
        SessionDurationPolicy.validate(expirationSeconds);
        this.encoder = encoder;
        this.decoder = decoder;
        this.expirationSeconds = expirationSeconds;
    }

    public JwtTokenService(RSAPublicKey publicKey, RSAPrivateKey privateKey, long expirationSeconds) {
        SessionDurationPolicy.validate(expirationSeconds);
        RSAKey rsaKey = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
        this.encoder = new NimbusJwtEncoder(new ImmutableJWKSet<SecurityContext>(new JWKSet(rsaKey)));
        NimbusJwtDecoder rsaDecoder = NimbusJwtDecoder.withPublicKey(publicKey).build();
        JwtTimestampValidator timestampValidator = new JwtTimestampValidator(Duration.ZERO);
        rsaDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestampValidator));
        this.decoder = rsaDecoder;
        this.expirationSeconds = expirationSeconds;
    }

    public String issue(UUID userId) {
        return issue(userId, false);
    }

    public String issue(UUID userId, boolean passwordChangeOnly) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expirationSeconds))
                .id(UUID.randomUUID().toString())
                .claim("password_change_only", passwordChangeOnly)
                .build();
        return encoder.encode(JwtEncoderParameters.from(
                org.springframework.security.oauth2.jwt.JwsHeader.with(SignatureAlgorithm.RS256).build(),
                claims)).getTokenValue();
    }

    public UUID parseUserId(String token) {
        return parse(token).userId();
    }

    public boolean parsePasswordChangeOnly(String token) {
        return parse(token).passwordChangeOnly();
    }

    public ParsedToken parse(String token) {
        try {
            var jwt = decoder.decode(token);
            return new ParsedToken(
                    UUID.fromString(jwt.getSubject()),
                    Boolean.TRUE.equals(jwt.getClaim("password_change_only")));
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidTokenException(exception);
        }
    }

    public Instant parseExpiration(String token) {
        try {
            return decoder.decode(token).getExpiresAt();
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidTokenException(exception);
        }
    }

    public int expirationSeconds() {
        return Math.toIntExact(expirationSeconds);
    }

    public record ParsedToken(UUID userId, boolean passwordChangeOnly) {
    }
}
