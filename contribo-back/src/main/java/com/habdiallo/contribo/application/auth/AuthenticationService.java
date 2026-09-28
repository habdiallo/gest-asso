package com.habdiallo.contribo.application.auth;

import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.AssociationSummary;
import com.habdiallo.contribo.api.generated.model.CurrentUser;
import com.habdiallo.contribo.api.generated.model.CurrencyCode;
import com.habdiallo.contribo.api.generated.model.IncomeCategorySummary;
import com.habdiallo.contribo.api.generated.model.LoginRequest;
import com.habdiallo.contribo.api.generated.model.LoginResponse;
import com.habdiallo.contribo.api.generated.model.MemberStatus;
import com.habdiallo.contribo.api.generated.model.MemberSummary;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.security.JwtTokenService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final AuthenticationAccountPort repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokenService;

    public AuthenticationService(
            AuthenticationAccountPort repository,
            PasswordEncoder passwordEncoder,
            JwtTokenService tokenService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public LoginResponse login(LoginRequest request) {
        AuthenticatedAccount account = repository.findByIdentifier(request.getIdentifier()).orElse(null);
        String passwordHash = account == null ? DUMMY_PASSWORD_HASH : account.passwordHash();
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), passwordHash);
        if (account == null || !account.active() || !passwordMatches) {
            throw new InvalidCredentialsException();
        }
        return new LoginResponse(
                tokenService.issue(account.userId()),
                LoginResponse.TokenTypeEnum.BEARER,
                tokenService.expirationSeconds(),
                toCurrentUser(account));
    }

    public CurrentUser currentUser(UUID userId) {
        AuthenticatedAccount account = repository.findById(userId)
                .filter(AuthenticatedAccount::active)
                .orElseThrow(InvalidCredentialsException::new);
        return toCurrentUser(account);
    }

    private CurrentUser toCurrentUser(AuthenticatedAccount account) {
        IncomeCategorySummary category = new IncomeCategorySummary(
                account.incomeCategoryId(), account.incomeCategoryLabel());
        MemberSummary member = new MemberSummary(
                account.memberId(),
                account.firstName(),
                account.lastName(),
                displayName(account),
                category,
                MemberStatus.fromValue(account.memberStatus()))
                .preferredName(account.preferredName())
                .country(account.country())
                .city(account.city())
                .phone(account.phone())
                .associationFunction(account.associationFunction());
        AssociationSummary association = new AssociationSummary(
                account.associationId(),
                account.associationName(),
                CurrencyCode.fromValue(account.currency()));
        UserRole role = UserRole.fromValue(account.role());
        return new CurrentUser(
                account.userId(),
                association,
                member,
                role,
                role == UserRole.OPERATOR && account.operatorCanRecordPayments(),
                account.active());
    }

    private String displayName(AuthenticatedAccount account) {
        return account.preferredName() == null || account.preferredName().isBlank()
                ? account.firstName() + " " + account.lastName()
                : account.preferredName() + " " + account.lastName();
    }
}
