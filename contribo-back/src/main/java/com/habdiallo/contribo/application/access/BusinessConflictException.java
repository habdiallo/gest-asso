package com.habdiallo.contribo.application.access;

import java.util.List;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.FieldError;

public class BusinessConflictException extends RuntimeException {

    private final ErrorCode code;
    private final List<FieldError> fieldErrors;

    public BusinessConflictException(ErrorCode code, String message) {
        this(code, message, List.of());
    }

    public BusinessConflictException(ErrorCode code, String message, List<FieldError> fieldErrors) {
        super(message);
        this.code = code;
        this.fieldErrors = fieldErrors;
    }

    public ErrorCode code() {
        return code;
    }

    public List<FieldError> fieldErrors() {
        return fieldErrors;
    }
}
