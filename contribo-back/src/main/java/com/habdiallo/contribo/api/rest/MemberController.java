package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.MembresApi;
import com.habdiallo.contribo.api.generated.model.CreateMemberRequest;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.MemberDetails;
import com.habdiallo.contribo.api.generated.model.MemberCreationResponse;
import com.habdiallo.contribo.api.generated.model.MemberPage;
import com.habdiallo.contribo.api.generated.model.MemberStatus;
import com.habdiallo.contribo.api.generated.model.UpdateMemberContactRequest;
import com.habdiallo.contribo.api.generated.model.UpdateMemberRequest;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.application.members.MemberService;

@RestController
public class MemberController implements MembresApi {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @Override
    public ResponseEntity<MemberCreationResponse> createMember(CreateMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(memberService.create(CurrentUserId.get(), request));
    }

    @Override
    public ResponseEntity<MemberDetails> deactivateMember(UUID memberId) {
        return ResponseEntity.ok(memberService.deactivate(CurrentUserId.get(), memberId));
    }

    @Override
    public ResponseEntity<MemberDetails> getMember(UUID memberId) {
        return ResponseEntity.ok(memberService.get(CurrentUserId.get(), memberId));
    }

    @Override
    public ResponseEntity<DuePage> listMemberDues(
            UUID memberId, Integer page, Integer size, DueStatus status) {
        return ResponseEntity.ok(memberService.listDues(CurrentUserId.get(), memberId, page, size, status));
    }

    @Override
    public ResponseEntity<MemberPage> listMembers(
            Integer page, Integer size, String query, MemberStatus status) {
        return ResponseEntity.ok(memberService.list(CurrentUserId.get(), page, size, query, status));
    }

    @Override
    public ResponseEntity<MemberDetails> reactivateMember(UUID memberId) {
        return ResponseEntity.ok(memberService.reactivate(CurrentUserId.get(), memberId));
    }

    @Override
    public ResponseEntity<MemberDetails> updateMember(UUID memberId, UpdateMemberRequest request) {
        return ResponseEntity.ok(memberService.update(
                CurrentUserId.get(), memberId, request, RequestBodyPresence.hasField("preferredName")));
    }

    @Override
    public ResponseEntity<MemberDetails> updateMemberContact(
            UUID memberId, UpdateMemberContactRequest request) {
        return ResponseEntity.ok(memberService.updateContact(
                CurrentUserId.get(), memberId, request, RequestBodyPresence.hasField("preferredName")));
    }
}
