package com.habdiallo.contribo.api.rest;

import java.util.Collections;
import java.util.Set;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.RequestAttributes;

final class RequestBodyPresence {

    static final String ATTRIBUTE = RequestBodyPresence.class.getName() + ".fields";

    private RequestBodyPresence() {
    }

    static boolean hasField(String field) {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return false;
        }
        Object value = attributes.getAttribute(ATTRIBUTE, RequestAttributes.SCOPE_REQUEST);
        return value instanceof Set<?> fields && fields.contains(field);
    }
}
