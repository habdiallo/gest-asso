package com.habdiallo.contribo.api.rest;

import com.habdiallo.contribo.api.generated.model.ErrorCode;

import org.springframework.http.HttpStatus;

public final class ApiErrors {

    private ApiErrors() {
    }

    public static ApiException forbidden() {
        return new ApiException(ErrorCode.ACCESS_DENIED, HttpStatus.FORBIDDEN,
                "Vous n'êtes pas autorisé à effectuer cette action.");
    }

    public static ApiException notFound() {
        return new ApiException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                "La ressource demandée est introuvable.");
    }

    public static ApiException conflict(ErrorCode code, String message) {
        return new ApiException(code, HttpStatus.CONFLICT, message);
    }

    public static ApiException badRequest(ErrorCode code, String message) {
        return new ApiException(code, HttpStatus.BAD_REQUEST, message);
    }
}
