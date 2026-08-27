// src/monetization/MonetizationManager.js
let adSlot = null;

export function initAds(slotElement) {
  adSlot = slotElement;
  adSlot.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#444;font-size:11px;">AD SPACE<br>(AdSense goes here)</div>';
}

export function hideAd() {
  if (adSlot) {
    adSlot.style.transition = 'opacity 1s ease';
    adSlot.style.opacity = '0';
    setTimeout(() => {
      adSlot.style.display = 'none';
    }, 1000);
  }
}

export function isAdVisible() {
  return adSlot && adSlot.style.display !== 'none';
}
