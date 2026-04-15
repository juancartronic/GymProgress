const FONT_LINK_ID = "gym-progress-fonts";

export const ensureAppFonts = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;

  const fontLink = document.createElement("link");
  fontLink.id = FONT_LINK_ID;
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(fontLink);
};
