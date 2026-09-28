package com.habdiallo.contribo.application.socialfund;

import org.springframework.http.HttpStatus;

import com.habdiallo.contribo.api.generated.model.ErrorCode;

public class SocialFundException extends RuntimeException {

    private final HttpStatus status;
    private final ErrorCode code;

    public SocialFundException(HttpStatus status, ErrorCode code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus status() {
        return status;
    }

    public ErrorCode code() {
        return code;
    }
}
