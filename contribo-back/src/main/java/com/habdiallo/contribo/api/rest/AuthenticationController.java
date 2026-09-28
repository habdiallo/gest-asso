package com.habdiallo.contribo.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.AuthentificationApi;
import com.habdiallo.contribo.api.generated.model.LoginRequest;
import com.habdiallo.contribo.api.generated.model.LoginResponse;
import com.habdiallo.contribo.application.auth.AuthenticationService;

@RestController
public class AuthenticationController implements AuthentificationApi {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest loginRequest) {
        return ResponseEntity.ok(authenticationService.login(loginRequest));
    }
}
