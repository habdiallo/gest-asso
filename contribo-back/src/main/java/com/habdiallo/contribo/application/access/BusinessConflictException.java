package com.habdiallo.contribo.application.access;

import com.habdiallo.contribo.api.generated.model.ErrorCode;

public class BusinessConflictException extends RuntimeException {

    private final ErrorCode code;

    public BusinessConflictException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }
}
