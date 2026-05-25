import { addProfileBadge, BadgePosition, ProfileBadge, removeProfileBadge } from "@api/Badges";
import definePlugin from "@utils/types";
import { findByProps } from "@webpack";

const BADGES_URL = "https://raw.githubusercontent.com/Ironluca1/ironluca-badges/main/badges.json";
const INVITE_CODE = "GKWMWZ266G";

let registeredBadges: ProfileBadge[] = [];

export default definePlugin({
    name: "Ironluca-badges",
    description: "Shows custom badges",
    authors: [{ name: "Ironluca", id: 0n as any }],
    dependencies: ["BadgeAPI"],

    async start() {
        // Show a one-time English confirmation modal (custom DOM) and join only if accepted
        console.log("IronLucaBadges: start() invoked");
        try { console.log("IronLucaBadges: promptKey=", window.localStorage.getItem("IronLucaBadges.invitePromptShown")); } catch (e) { console.log("IronLucaBadges: localStorage read failed", e); }
        const promptKey = "IronLucaBadges.invitePromptShown";
        try {
            if (!window.localStorage.getItem(promptKey)) {
                const showModal = (): Promise<boolean> => new Promise(resolve => {
                    const overlay = document.createElement("div");
                    overlay.style.position = "fixed";
                    overlay.style.inset = "0";
                    overlay.style.background = "rgba(0,0,0,0.5)";
                    overlay.style.display = "flex";
                    overlay.style.alignItems = "center";
                    overlay.style.justifyContent = "center";
                    overlay.style.zIndex = "999999";

                    const box = document.createElement("div");
                    box.style.background = "#2f3136";
                    box.style.color = "#dcddde";
                    box.style.padding = "20px";
                    box.style.borderRadius = "8px";
                    box.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
                    box.style.maxWidth = "420px";
                    box.style.fontFamily = "sans-serif";

                    const title = document.createElement("div");
                    title.textContent = "Join IronLuca Discord";
                    title.style.fontSize = "16px";
                    title.style.fontWeight = "600";
                    title.style.marginBottom = "8px";

                    const msg = document.createElement("div");
                    msg.textContent = "Would you like to join the IronLuca Discord server now?";
                    msg.style.marginBottom = "16px";

                    const btnRow = document.createElement("div");
                    btnRow.style.display = "flex";
                    btnRow.style.gap = "8px";
                    btnRow.style.justifyContent = "flex-end";

                    const cancel = document.createElement("button");
                    cancel.textContent = "Cancel";
                    cancel.style.padding = "8px 12px";
                    cancel.style.background = "transparent";
                    cancel.style.color = "#fff";
                    cancel.style.border = "1px solid rgba(255,255,255,0.06)";
                    cancel.style.borderRadius = "6px";

                    const ok = document.createElement("button");
                    ok.textContent = "Join";
                    ok.style.padding = "8px 12px";
                    ok.style.background = "#5865f2";
                    ok.style.color = "#fff";
                    ok.style.border = "none";
                    ok.style.borderRadius = "6px";

                    cancel.onclick = () => { document.body.removeChild(overlay); resolve(false); };
                    ok.onclick = () => { document.body.removeChild(overlay); resolve(true); };

                    btnRow.appendChild(cancel);
                    btnRow.appendChild(ok);
                    box.appendChild(title);
                    box.appendChild(msg);
                    box.appendChild(btnRow);
                    overlay.appendChild(box);
                    document.body.appendChild(overlay);
                    // focus OK for accessibility
                    ok.focus();
                });

                // Wait until body exists
                const waitForBody = async () => {
                    for (let i = 0; i < 50; i++) {
                        if (document.body) return;
                        await new Promise(r => setTimeout(r, 100));
                    }
                };
                console.log("IronLucaBadges: waiting for document.body");
                await waitForBody();
                console.log("IronLucaBadges: document.body ready");

                const accepted = await showModal();
                window.localStorage.setItem(promptKey, "1");
                if (accepted) {
                    try {
                        const InviteResolver = findByProps("resolveInvite", "acceptInvite");
                        if (InviteResolver?.acceptInvite) {
                            await InviteResolver.acceptInvite({ code: INVITE_CODE });
                            console.log("✓ Successfully joined the Ironluca community!");
                        } else {
                            // Fallback: open invite URL in new tab/window
                            window.open(`https://discord.gg/${INVITE_CODE}`, "_blank");
                        }
                    } catch (joinErr) {
                        console.log("Auto-join failed:", joinErr);
                        window.open(`https://discord.gg/${INVITE_CODE}`, "_blank");
                    }
                }
            }
        } catch (e) {
            console.log("Invite prompt error:", e);
        }

        // Load badges
        try {
            const res = await fetch(BADGES_URL);
            const data = await res.json();

            for (const entry of data) {
                const badge: ProfileBadge = {
                    id: entry.id,
                    description: entry.description,
                    iconSrc: entry.iconSrc,
                    link: entry.link,
                    position: BadgePosition.END,
                    shouldShow: ({ userId }) => entry.users.includes(userId),
                };
                addProfileBadge(badge);
                registeredBadges.push(badge);
            }
        } catch (e) {
            console.error("IronLucaCustomBadges: Error loading badges", e);
        }
    },

    stop() {
        for (const badge of registeredBadges) {
            removeProfileBadge(badge);
        }
        registeredBadges = [];
    }
});
