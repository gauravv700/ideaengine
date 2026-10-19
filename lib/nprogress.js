"use client";

import NProgress from "nprogress";

const MIN_VISIBLE_MS = 800;
let startedAt = 0;

NProgress.configure({
  showSpinner: false,
  minimum: 0.12,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  speed: 420,
  trickle: true,
  trickleRate: 0.04,
  trickleSpeed: 90,
});

export function startProgress() {
  startedAt = Date.now();
  document.body.classList.add("page-loading");
  NProgress.start();
}

export function doneProgress() {
  const elapsed = startedAt ? Date.now() - startedAt : MIN_VISIBLE_MS;
  const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

  window.setTimeout(() => {
    NProgress.done();
    document.body.classList.remove("page-loading");
    startedAt = 0;
  }, wait);
}
