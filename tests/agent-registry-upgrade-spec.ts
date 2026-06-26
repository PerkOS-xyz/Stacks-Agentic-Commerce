;; Tests for Agent Registry upgradeability

(import-contract 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.agent-registry 'agent-registry)

;; Test: upgrade-implementation by owner
(define-test (test-upgrade-implementation)
  (let ((original-impl (var-get agent-registry.current-implementation)))
    (asserts (is-eq tx-sender (var-get agent-registry.owner)) u"Only owner can upgrade")
    (asserts (is-ok (upgrade-implementation 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.new-impl)) u"Upgrade succeeded")
    (asserts (is-eq (var-get agent-registry.current-implementation) 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.new-impl) u"Implementation updated")
  )
)

;; Test: upgrade-implementation by non-owner
(define-test (test-upgrade-implementation-non-owner)
  (asserts (is-err (upgrade-implementation 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.new-impl)) u"Non-owner cannot upgrade")
)
