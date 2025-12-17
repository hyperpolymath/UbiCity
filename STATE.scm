;;; STATE.scm - Project Checkpoint
;;; ubicity
;;; Format: Guile Scheme S-expressions
;;; Purpose: Preserve AI conversation context across sessions
;;; Reference: https://github.com/hyperpolymath/state.scm

;; SPDX-License-Identifier: AGPL-3.0-or-later
;; SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell

;;;============================================================================
;;; METADATA
;;;============================================================================

(define metadata
  '((version . "0.1.0")
    (schema-version . "1.0")
    (created . "2025-12-15")
    (updated . "2025-12-17")
    (project . "ubicity")
    (repo . "github.com/hyperpolymath/ubicity")))

;;;============================================================================
;;; PROJECT CONTEXT
;;;============================================================================

(define project-context
  '((name . "ubicity")
    (tagline . "> *Making the city itself a learning environment, one captured experience at a time.*")
    (version . "0.1.0")
    (license . "AGPL-3.0-or-later")
    (rsr-compliance . "gold-target")

    (tech-stack
     ((primary . "See repository languages")
      (ci-cd . "GitHub Actions + GitLab CI + Bitbucket Pipelines")
      (security . "CodeQL + OSSF Scorecard")))))

;;;============================================================================
;;; CURRENT POSITION
;;;============================================================================

(define current-position
  '((phase . "v0.1 - Initial Setup and RSR Compliance")
    (overall-completion . 30)

    (components
     ((rsr-compliance
       ((status . "complete")
        (completion . 100)
        (notes . "SHA-pinned actions, SPDX headers, multi-platform CI")))

      (security
       ((status . "complete")
        (completion . 100)
        (notes . "Security policy fixed, HTTP detection bug resolved, security.txt RFC 9116 compliant")))

      (documentation
       ((status . "foundation")
        (completion . 35)
        (notes . "README, META/ECOSYSTEM/STATE.scm, THREAT_MODEL.md complete")))

      (testing
       ((status . "minimal")
        (completion . 10)
        (notes . "CI/CD scaffolding exists, limited test coverage")))

      (core-functionality
       ((status . "in-progress")
        (completion . 25)
        (notes . "Initial implementation underway - ReScript migration pending")))))

    (working-features
     ("RSR-compliant CI/CD pipeline"
      "Multi-platform mirroring (GitHub, GitLab, Bitbucket)"
      "SPDX license headers on all files"
      "SHA-pinned GitHub Actions"
      "Security policy with GitHub private reporting"
      "Threat model documented"
      "CodeQL + OSSF Scorecard integration"))))

;;;============================================================================
;;; ROUTE TO MVP
;;;============================================================================

(define route-to-mvp
  '((target-version . "1.0.0")
    (definition . "Stable release with comprehensive documentation and tests")

    (milestones
     ((v0.2
       ((name . "Core Functionality")
        (status . "in-progress")
        (items
         ("Complete ReScript migration (TS/JS -> RSR)"
          "Implement WHO/WHERE/WHAT capture CLI"
          "Add Zod/WASM validation for schemas"
          "Initial test coverage (30%)"))))

      (v0.3
       ((name . "Analysis & Visualization")
        (status . "pending")
        (items
         ("Implement mapper.js analysis (hotspots, networks, journeys)"
          "Generate static HTML visualizations"
          "Export formats (CSV, GeoJSON, DOT)"
          "Test coverage > 50%"))))

      (v0.5
       ((name . "Feature Complete")
        (status . "pending")
        (items
         ("All planned features implemented"
          "Privacy tools (anonymization, PII removal, GPS fuzzing)"
          "Test coverage > 70%"
          "API stability"))))

      (v1.0
       ((name . "Production Release")
        (status . "pending")
        (items
         ("Comprehensive test coverage > 80%"
          "Performance optimization (async I/O)"
          "External security audit"
          "User documentation complete"
          "Encryption at rest (optional)"))))))))

;;;============================================================================
;;; BLOCKERS & ISSUES
;;;============================================================================

(define blockers-and-issues
  '((critical
     ())  ;; No critical blockers

    (high-priority
     ())  ;; No high-priority blockers

    (medium-priority
     ((test-coverage
       ((description . "Limited test infrastructure")
        (impact . "Risk of regressions")
        (needed . "Comprehensive test suites")))))

    (low-priority
     ((documentation-gaps
       ((description . "Some documentation areas incomplete")
        (impact . "Harder for new contributors")
        (needed . "Expand documentation")))))))

;;;============================================================================
;;; CRITICAL NEXT ACTIONS
;;;============================================================================

(define critical-next-actions
  '((immediate
     (("Review and update documentation" . medium)
      ("Add initial test coverage" . high)
      ("Verify CI/CD pipeline functionality" . high)))

    (this-week
     (("Implement core features" . high)
      ("Expand test coverage" . medium)))

    (this-month
     (("Reach v0.2 milestone" . high)
      ("Complete documentation" . medium)))))

;;;============================================================================
;;; SESSION HISTORY
;;;============================================================================

(define session-history
  '((snapshots
     (((date . "2025-12-17")
       (session . "security-review-and-roadmap")
       (accomplishments
        ("Fixed SECURITY.md with correct version information"
         "Fixed security-policy.yml HTTP URL detection bug (was checking https instead of http)"
         "Updated security.txt with GitHub Security Advisories + real contact email"
         "Verified all SCM files have valid syntax (balanced parens/quotes)"
         "Updated STATE.scm with detailed roadmap and milestones"
         "Added security component tracking to current-position"))
       (notes . "Security review session - all critical security matters resolved"))

      ((date . "2025-12-15")
       (session . "initial-state-creation")
       (accomplishments
        ("Added META.scm, ECOSYSTEM.scm, STATE.scm"
         "Established RSR compliance"
         "Created initial project checkpoint"))
       (notes . "First STATE.scm checkpoint created via automated script"))))))

;;;============================================================================
;;; HELPER FUNCTIONS (for Guile evaluation)
;;;============================================================================

(define (get-completion-percentage component)
  "Get completion percentage for a component"
  (let ((comp (assoc component (cdr (assoc 'components current-position)))))
    (if comp
        (cdr (assoc 'completion (cdr comp)))
        #f)))

(define (get-blockers priority)
  "Get blockers by priority level"
  (cdr (assoc priority blockers-and-issues)))

(define (get-milestone version)
  "Get milestone details by version"
  (assoc version (cdr (assoc 'milestones route-to-mvp))))

;;;============================================================================
;;; EXPORT SUMMARY
;;;============================================================================

(define state-summary
  '((project . "ubicity")
    (version . "0.1.0")
    (overall-completion . 30)
    (next-milestone . "v0.2 - Core Functionality (in-progress)")
    (critical-blockers . 0)
    (high-priority-issues . 0)
    (security-status . "complete")
    (updated . "2025-12-17")))

;;; End of STATE.scm
