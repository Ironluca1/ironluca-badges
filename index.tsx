import { addProfileBadge, BadgePosition, ProfileBadge, removeProfileBadge } from "@api/Badges";
import definePlugin from "@utils/types";

const BADGES_URL = "https://raw.githubusercontent.com/Ironluca1/ironluca-badges/main/badges.json";

let registeredBadges: ProfileBadge[] = [];

export default definePlugin({
    name: "Ironluca-badges",
    description: "Shows custom badges",
    authors: [{ name: "Ironluca", id: 0n as any }],
    dependencies: ["BadgeAPI"],

    async start() {
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
            console.error("IronLucaCustomBadges: Fehler beim Laden der Badges", e);
        }
    },

    stop() {
        for (const badge of registeredBadges) {
            removeProfileBadge(badge);
        }
        registeredBadges = [];
    }
});
