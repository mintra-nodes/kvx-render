const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();
app.use(cors());

async function fetchPage(url) {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000
    });

    const content = await page.evaluate(() => {
        document.querySelectorAll("script, style, iframe, nav, footer").forEach(el => el.remove());
        return document.body.innerText;
    });

    await browser.close();

    return content.slice(0, 8000);
}

// 🌐 BROWSER ROUTE
app.get("/browse", async (req, res) => {
    try {
        let url = req.query.url;

        if (!url) return res.json({ error: "No URL" });
        if (!url.startsWith("http")) url = "https://" + url;

        const content = await fetchPage(url);

        res.json({
            url,
            content
        });

    } catch (err) {
        res.json({
            error: "Failed to load page"
        });
    }
});

// 🔎 SEARCH ROUTE (Google rendered)
app.get("/search", async (req, res) => {
    try {
        const q = req.query.q;
        const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;

        const content = await fetchPage(url);

        res.json({
            url,
            content
        });

    } catch {
        res.json({ error: "Search failed" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Playwright proxy running on " + PORT);
});
