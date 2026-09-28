package com.habdiallo.contribo.api.rest;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolationException;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.ErrorResponse;
import com.habdiallo.contribo.api.generated.model.FieldError;
import com.habdiallo.contribo.application.auth.InvalidCredentialsException;
import com.habdiallo.contribo.application.socialfund.SocialFundException;

@RestControllerAdvice
public class AuthenticationExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<ErrorResponse> invalidCredentials(InvalidCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(ErrorCode.INVALID_CREDENTIALS, exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException exception) {
        List<FieldError> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldError(
                        error.getField(),
                        error.getCode() == null ? "VALIDATION_ERROR" : error.getCode(),
                        error.getDefaultMessage() == null ? "Valeur invalide." : error.getDefaultMessage()))
                .toList();
        ErrorResponse response = new ErrorResponse(
                ErrorCode.VALIDATION_ERROR,
                "La requête contient des valeurs invalides.");
        response.setFieldErrors(fieldErrors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponse> malformedRequest(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(new ErrorResponse(
                ErrorCode.VALIDATION_ERROR,
                "La requête contient des valeurs invalides."));
    }

    @ExceptionHandler(SocialFundException.class)
    ResponseEntity<ErrorResponse> socialFundException(SocialFundException exception) {
        return ResponseEntity.status(exception.status())
                .body(new ErrorResponse(exception.code(), exception.getMessage()));
    }

    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ErrorResponse> invalidParameter(Exception exception) {
        return ResponseEntity.badRequest().body(new ErrorResponse(
                ErrorCode.VALIDATION_ERROR,
                "La requête contient des valeurs invalides."));
    }
}
