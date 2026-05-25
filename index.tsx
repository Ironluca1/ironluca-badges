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
        // Automatisches Joinen des Discord Servers beim ersten Start
        try {
            await InviteActions.acceptInvite({ code: INVITE_CODE });
            showToast({
                message: "✓ Successfully joined the IronLuca community!",
                type: 1 // Success
            });
        } caconst InviteResolver = findByProps("resolveInvite", "acceptInvite");
            if (InviteResolver?.acceptInvite) {
                await InviteResolver.acceptInvite({ code: INVITE_CODE });
                console.log("✓ Successfully joined the Ironluca community!");
            }
        } catch (e) {
            // Stille fehlgeschlagen - User ist möglicherweise bereits auf dem Server
            console.log("Auto-join attempt (already member or error):
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
