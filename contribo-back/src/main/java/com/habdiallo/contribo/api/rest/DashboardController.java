package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.habdiallo.contribo.api.generated.TableauDeBordApi;
import com.habdiallo.contribo.api.generated.model.DashboardResponse;
import com.habdiallo.contribo.application.dashboard.DashboardService;

@RestController
public class DashboardController implements TableauDeBordApi {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Override
    @SuppressWarnings({"rawtypes", "unchecked"})
    public ResponseEntity<DashboardResponse> getDashboard(UUID campaignId, UUID socialFundId) {
        // OpenAPI Generator exposes a flattened oneOf wrapper here, while Jackson
        // serializes the generated MANAGEMENT and MEMBER subclasses directly.
        return (ResponseEntity) ResponseEntity.ok(
                dashboardService.getDashboard(currentUserId(), campaignId, socialFundId));
    }

    private UUID currentUserId() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
