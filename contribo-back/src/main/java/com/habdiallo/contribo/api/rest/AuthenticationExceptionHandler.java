package com.habdiallo.contribo.api.rest;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;

import jakarta.validation.ConstraintViolationException;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.ErrorResponse;
import com.habdiallo.contribo.api.generated.model.FieldError;
import com.habdiallo.contribo.application.access.AccessDeniedException;
import com.habdiallo.contribo.application.access.BusinessConflictException;
import com.habdiallo.contribo.application.access.ResourceNotFoundException;
import com.habdiallo.contribo.application.auth.InvalidCredentialsException;

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

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> accessDenied(AccessDeniedException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(ErrorCode.ACCESS_DENIED, exception.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ErrorResponse> resourceNotFound(ResourceNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ErrorCode.RESOURCE_NOT_FOUND, exception.getMessage()));
    }

    @ExceptionHandler(BusinessConflictException.class)
    ResponseEntity<ErrorResponse> businessConflict(BusinessConflictException exception) {
        ErrorResponse response = new ErrorResponse(exception.code(), exception.getMessage());
        response.setFieldErrors(exception.fieldErrors());
        if (exception.code() == ErrorCode.VALIDATION_ERROR) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler({ConstraintViolationException.class, MethodArgumentTypeMismatchException.class})
    ResponseEntity<ErrorResponse> invalidParameter(Exception exception) {
        return ResponseEntity.badRequest().body(new ErrorResponse(
                ErrorCode.VALIDATION_ERROR,
                "La requête contient des valeurs invalides."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> integrityConflict(DataIntegrityViolationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ErrorCode.BUSINESS_CONFLICT,
                        "L'opération viole une contrainte métier."));
    }
}
