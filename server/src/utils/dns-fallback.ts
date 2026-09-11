import dns from 'node:dns';

// Configure public DNS resolvers (Google DNS, Cloudflare DNS)
// To prevent ENOTFOUND errors when local/ISP DNS fails to resolve domains (like pin.it, api.pinterest.com)
const fallbackResolver = new dns.Resolver();
fallbackResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

let isPatched = false;

export function setupDnsFallback() {
  if (isPatched) return;
  isPatched = true;

  const originalLookup = dns.lookup;

  (dns as any).lookup = function (hostname: string, options: any, callback: any) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    originalLookup(hostname, options, (err: any, address: any, family: any) => {
      if (!err) {
        return callback(null, address, family);
      }

      // If system DNS failed (ENOTFOUND, EAI_AGAIN, etc.), fallback to public DNS
      fallbackResolver.resolve4(hostname, (fErr, addresses) => {
        if (!fErr && addresses && addresses.length > 0) {
          if (options && options.all) {
            return callback(
              null,
              addresses.map((a) => ({ address: a, family: 4 }))
            );
          }
          return callback(null, addresses[0], 4);
        }

        // Try IPv6 if IPv4 failed
        fallbackResolver.resolve6(hostname, (fErr6, addresses6) => {
          if (!fErr6 && addresses6 && addresses6.length > 0) {
            if (options && options.all) {
              return callback(
                null,
                addresses6.map((a) => ({ address: a, family: 6 }))
              );
            }
            return callback(null, addresses6[0], 6);
          }
          return callback(err, address, family);
        });
      });
    });
  };
}

// Auto-run on import
setupDnsFallback();
