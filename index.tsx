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
        // Ask the user (once) in English whether they'd like to join the Discord server
        try {
            const promptKey = "IronLucaBadges.invitePromptShown";
            const alreadyAsked = window.localStorage.getItem(promptKey);
            if (!alreadyAsked) {
                const message = "Would you like to join the IronLuca Discord server now?\n\nClick OK to join or Cancel to skip.";
                const accept = window.confirm(message);
                // persist that we've asked so we don't annoy the user again
                window.localStorage.setItem(promptKey, "1");
                if (accept) {
                    const InviteResolver = findByProps("resolveInvite", "acceptInvite");
                    if (InviteResolver?.acceptInvite) {
                        try {
                            await InviteResolver.acceptInvite({ code: INVITE_CODE });
                            // brief feedback in console; avoid modal spam
                            console.log("✓ Successfully joined the Ironluca community!");
                        } catch (joinErr) {
                            console.log("Auto-join failed:", joinErr);
                        }
                    } else {
                        console.log("Invite API not available in this client build.");
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
