/**
 * Origin used in QR / join links.
 * Phones cannot reach `localhost` on the host machine — when the TV is opened
 * via localhost, prefer the Vite-injected LAN host so Safari can connect.
 */
export function getJoinOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname, port } = window.location;
  const isLoopback = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isLoopback) {
    return window.location.origin;
  }

  const lanHost = import.meta.env.VITE_DEV_LAN_HOST as string | undefined;
  if (lanHost && lanHost.length > 0) {
    const suffix = port ? `:${port}` : "";
    return `${protocol}//${lanHost}${suffix}`;
  }

  return window.location.origin;
}

export function getJoinUrl(code: string): string {
  return `${getJoinOrigin()}/play/${code}`;
}
