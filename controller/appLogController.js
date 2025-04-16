const os = require("os");
const crypto = require("crypto");
const useragent = require("useragent");
const geoip = require("geoip-lite");

const generateDeviceFingerprint = (req) => {
  const components = [
    req.headers["user-agent"],
    req.headers["accept-language"],
    req.headers["sec-ch-ua-platform"],
    req.headers["sec-ch-ua"],
  ].filter(Boolean);

  return crypto.createHash("sha256").update(components.join("|")).digest("hex");
};

const getClientIp = (req) => {
  const ipAddress =
    req.headers["cf-connecting-ip"] || // Cloudflare
    req.headers["x-real-ip"] || // Nginx
    req.headers["x-client-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0] || // Get first IP if multiple
    req.connection.remoteAddress?.replace(/^::ffff:/, "") || // IPv6 to IPv4
    "unknown";

  return ipAddress;
};

const appLogs = async (req, res) => {
  try {
    // Device Fingerprint
    const deviceFingerprint = generateDeviceFingerprint(req);

    // IP Information
    const clientIp = getClientIp(req);
    const geoData = geoip.lookup(clientIp) || {};

    // User Agent Information
    const agent = useragent.parse(req.headers["user-agent"]);

    // System Information
    const systemInfo = {
      platform: os.platform(),
      release: os.release(),
      architecture: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
    };

    // Network Information
    const networkInterfaces = os.networkInterfaces();
    const macAddresses = Object.values(networkInterfaces)
      .flat()
      .filter((ni) => ni.mac && ni.mac !== "00:00:00:00:00:00")
      .map((ni) => ({
        address: ni.mac,
        interface: ni.internal ? "internal" : "external",
        family: ni.family,
      }));

    const deviceInfo = {
      timestamp: new Date().toISOString(),
      deviceFingerprint,
      network: {
        ip: clientIp,
        geo: {
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          timezone: geoData.timezone,
        },
        macAddresses,
      },
      browser: {
        name: agent.family,
        version: agent.toVersion(),
        os: agent.os.toString(),
        device: agent.device.toString(),
      },
      system: systemInfo,
      headers: {
        language: req.headers["accept-language"],
        platform: req.headers["sec-ch-ua-platform"],
        mobile: req.headers["sec-ch-ua-mobile"],
      },
    };

    res.json(deviceInfo);
  } catch (error) {
    console.error("Device info error:", error);
    res.status(500).json({
      error: "Failed to fetch device information",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = { appLogs };
