const os = require("os");

const appLogs = async (req, res) => {
    // Generate unique number
    const uniquenumber = Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Get IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;

    try {
        const os_version = os.version();
        const networkInterfaces = os.networkInterfaces();
        
        // Loop through network interfaces to find the first valid MAC address
        let macAddress = 'No MAC Address';
        for (const interfaceKey in networkInterfaces) {
            const networkInterface = networkInterfaces[interfaceKey];
            const validInterface = networkInterface.find(details => details.mac && details.mac !== '00:00:00:00:00:00');
            if (validInterface) {
                macAddress = validInterface.mac;
                break;
            }
        }
        
        const osInfo = {
            os_version,
            os_macadd: macAddress,
            uid: uniquenumber,
            ip: ip
        };

        res.json(osInfo);
    } catch (error) {
        res.status(404).json({ message: `Failed to fetch system information: ${error.message}` });
    }
};

module.exports = { appLogs };
