import { precacheAndRoute } from "workbox-precaching";
import { subWithReg } from "./push.ts";
import "./init-db.ts";
import { latestPing } from "./pings.ts";

const manifest = self.__WB_MANIFEST.filter(page => !page.url.includes("logo/") && !page.url.includes(".git") && !page.url.includes("robots.txt") && !page.url.includes("stackedit.css") && !page.url.includes(".png") && !page.url.includes("disclaimer.txt") && !page.url.includes("template")).concat([
    { url: "media/d1.mp3", revision: "1" },
    { url: "media/d2.mp3", revision: "1" },
    { url: "media/d3.mp3", revision: "1" },
]);
precacheAndRoute(
    manifest,
    {
        urlManipulation: ({ url }) => {
            if (url.pathname.match(/^\/(app|settings|cntpings|welcome|graphs(\/.+)?)\/?$/)) {
                console.log("match");
                return [new URL("/app.html", location.href)];
            }
            return [];
        }
    }
);

async function onActivate() {
    const notifsInfo = await self.db.keyVal.get("notifs");
    if (!notifsInfo || !notifsInfo.value) return;
    await subWithReg(self.registration);
}

function wait(time) {
    return new Promise((resolve, _reject) => setTimeout(resolve, time));
}

self.addEventListener("message", event => {
    event.waitUntil((async () => {
        if (event.data === "earlyClaim") {
            await self.skipWaiting();
            const clients = await self.clients.matchAll({type: "window"});
            await Promise.all(clients.map((tab, i) =>
                // reload with a delay to stop both tabs from accessing the DB on load at the same time
                wait(i * 500).then(() => tab.navigate(tab.url))
            ));
        } else {
            console.warn("Unknown message recieved in SW", event.data);
        }
    })());
})

self.addEventListener("activate", event => {
    event.waitUntil(onActivate());
});

// notifications
self.addEventListener("pushsubscriptionchange", function (event) {
    console.log("Subscription expired");
    event.waitUntil(
        subWithReg(self.registration)
    );
});

async function handleNotificationClick() {
    console.log("Notification clicked");
    if (!self.clients || !self.clients.matchAll) {
        console.log("but we don't support matchAll so not focusing");
        return;
    }
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
    if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({
            includeUncontrolled: true,
            id: "tag-focus",
        });
    } else {
        clients.openWindow("/app").then(windowClient => windowClient ? windowClient.focus() : null);
    }
}
self.addEventListener("notificationclick", async event => {
    event.waitUntil(handleNotificationClick());
});

async function handlePush(event) {
    const pushData = event.data.json();
    console.log("got push", pushData);
    if (pushData.type === "ping") {
        let lastPingData = null;
        try {
            // sometimes we get errors from Dexie about the DB being closed, so in that case just ignore it
            lastPingData = await latestPing();
        } catch (e) {
            console.warn("Got Dexie error, ignoring", e);
        }
        // have we already responded to the ping? if so ignore the push
        // sometimes this causes browsers to display a notification anyways, but we can't stop that
        if ((lastPingData !== null) && (lastPingData.time >= pushData.latestPing)) return;
        registration.showNotification(`Ping! ${new Date(pushData.latestPing * 1000).toLocaleTimeString().split(" ")[0]}`, {
            lang: "en",
            renotify: true,
            tag: "retag-ping",
        });
    }
}

self.addEventListener("push", function (event) {
    event.waitUntil(handlePush(event));
});
