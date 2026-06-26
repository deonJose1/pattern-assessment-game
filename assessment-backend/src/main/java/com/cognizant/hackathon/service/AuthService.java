package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.AuthResponse;
import com.cognizant.hackathon.dto.LoginRequest;
import com.cognizant.hackathon.entity.AdminUser;
import com.cognizant.hackathon.repository.AdminUserRepository;
import com.cognizant.hackathon.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ALLOWED_DOMAIN = "@cognizant.com";

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final AdminUserRepository adminUserRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim();

        if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
            throw new BadCredentialsException("Email must be a " + ALLOWED_DOMAIN + " address");
        }

        // Throws BadCredentialsException on invalid email/password.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtService.generateToken(userDetails);
        return new AuthResponse(token, admin.getEmail(), admin.getRole().name());
    }
}
