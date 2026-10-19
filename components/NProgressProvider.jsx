"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { doneProgress, startProgress } from "@/lib/nprogress";

export default function NProgressProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRouteRender = useRef(true);
  const routeKey = useMemo(() => {
    const search = searchParams?.toString() || "";
    return `${pathname || ""}${search ? `?${search}` : ""}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isFirstRouteRender.current) {
      isFirstRouteRender.current = false;
      return;
    }

    doneProgress();
  }, [routeKey]);

  useEffect(() => {
    const handleClick = (event) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

      startProgress();
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      doneProgress();
    };
  }, []);

  return children;
}
