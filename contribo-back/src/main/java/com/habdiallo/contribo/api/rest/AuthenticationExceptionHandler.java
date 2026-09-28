package com.habdiallo.contribo.api.rest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.ErrorResponse;
import com.habdiallo.contribo.application.auth.InvalidCredentialsException;

@RestControllerAdvice
public class AuthenticationExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<ErrorResponse> invalidCredentials(InvalidCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(ErrorCode.INVALID_CREDENTIALS, exception.getMessage()));
    }
}
