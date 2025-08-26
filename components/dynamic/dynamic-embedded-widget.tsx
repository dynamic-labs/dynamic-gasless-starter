"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { DynamicEmbeddedWidget as DynamicEmbeddedWidgetComponent } from "@/lib/dynamic";
import { TransactionModal } from "@/components/transaction-modal";
import { MintTokens } from "../mint-tokens";

export default function DynamicEmbeddedWidget() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mountEl, setMountEl] = useState<HTMLElement | null>(null);
  const [depositClass, setDepositClass] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ensureMount = () => {
      const hosts = [
        ...Array.from(
          (containerRef.current as HTMLElement).querySelectorAll(
            '[data-testid$="-shadow"]'
          )
        ),
        ...Array.from(
          (containerRef.current as HTMLElement).querySelectorAll(
            ".dynamic-shadow-dom.embedded-widget"
          )
        ),
      ];

      for (const host of hosts) {
        const shadowRoot = (host as any).shadowRoot as ShadowRoot | null;
        if (!shadowRoot) continue;

        const primary = shadowRoot.querySelector(
          '[data-testid="primaryWalletStatus"]'
        );
        if (!primary) continue;

        const findDepositButton = (root: ParentNode): HTMLElement | null => {
          const candidates = Array.from(
            root.querySelectorAll("button, a, [role='button']")
          );
          for (const cand of candidates) {
            const text = (cand.textContent || "").toLowerCase();
            const aria = (
              (cand as HTMLElement).getAttribute("aria-label") || ""
            ).toLowerCase();
            if (text.includes("deposit") || aria.includes("deposit")) {
              return cand as HTMLElement;
            }
          }
          return null;
        };

        const deposit = findDepositButton(shadowRoot);
        if (!deposit || !deposit.parentElement) continue;
        deposit.style.display = "none";

        const existing = shadowRoot.querySelector(
          '[data-testid="mint-inline-mount"]'
        ) as HTMLElement | null;
        const mount = existing ?? document.createElement("div");
        if (!existing) {
          mount.setAttribute("data-testid", "mint-inline-mount");
          deposit.parentElement.insertBefore(mount, deposit);
        }

        setDepositClass(deposit.className || "");
        setMountEl(mount);
        return;
      }
    };

    // Initial attempt and observer
    ensureMount();
    const obs = new MutationObserver(() => ensureMount());
    obs.observe(containerRef.current, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <DynamicEmbeddedWidgetComponent background="default" />
      {mountEl &&
        createPortal(
          <MintTokens
            className={depositClass}
            onTransactionSuccess={() => setIsSuccess(true)}
            onTransactionStart={() => {
              setShowModal(true);
              setIsSuccess(false);
            }}
            onTransactionEnd={() => {
              setShowModal(false);
              setIsSuccess(false);
            }}
          />,
          mountEl
        )}
      {showModal && (
        <TransactionModal
          isSuccess={isSuccess}
          onClose={() => {
            setShowModal(false);
            setIsSuccess(false);
          }}
        />
      )}
    </div>
  );
}
