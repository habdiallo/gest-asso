package com.habdiallo.contribo.application.access;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException() {
        super("La ressource demandée est introuvable.");
    }
}
