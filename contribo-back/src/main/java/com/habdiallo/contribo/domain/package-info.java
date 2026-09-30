/**
 * Ce package ne contient aujourd'hui aucun modèle métier distinct. Les
 * services applicatifs et les repositories utilisent directement, comme
 * représentation interne, les types générés depuis le contrat OpenAPI
 * (`besoins/openapi.yaml`, sous {@code com.habdiallo.contribo.api.generated.model}) :
 * il n'y a pas de séparation domaine/contrat déjà réalisée.
 *
 * <p>Introduire un modèle domaine distinct des DTOs générés reste une
 * évolution possible, mais elle constituerait un refactor transverse à tout
 * le backend (services, ports, adapters) ; elle nécessite un change OpenSpec
 * dédié et une décision produit explicite, et n'est pas traitée ici.
 */
package com.habdiallo.contribo.domain;
