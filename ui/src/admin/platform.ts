import type { AdminHostContext, AdminHostServiceBag, HostServiceId } from './types';

export const HOST_SERVICE_IDS = {
  cedrosLogin: 'cedros-login',
  cedrosPay: 'cedros-pay',
  org: 'org',
  dashboardPermissions: 'dashboard-permissions',
} as const;

export function createAdminHostServiceBag(
  initialServices: AdminHostServiceBag = {}
): AdminHostServiceBag {
  return { ...initialServices };
}

export function buildAdminHostServiceBag(hostContext: AdminHostContext): AdminHostServiceBag {
  const services = createAdminHostServiceBag(hostContext.services);
  addFallbackService(services, HOST_SERVICE_IDS.cedrosLogin, hostContext.cedrosLogin);
  addFallbackService(services, HOST_SERVICE_IDS.cedrosPay, hostContext.cedrosPay);
  addFallbackService(services, HOST_SERVICE_IDS.org, hostContext.org);
  addFallbackService(
    services,
    HOST_SERVICE_IDS.dashboardPermissions,
    hostContext.dashboardPermissions
  );
  return services;
}

export function getHostService<T>(
  hostContext: AdminHostContext,
  serviceId: HostServiceId
): T | undefined {
  return getServiceFromBag<T>(buildAdminHostServiceBag(hostContext), serviceId);
}

export function getServiceFromBag<T>(
  services: AdminHostServiceBag,
  serviceId: HostServiceId
): T | undefined {
  return services[serviceId] as T | undefined;
}

function addFallbackService(
  services: AdminHostServiceBag,
  serviceId: HostServiceId,
  service: unknown
): void {
  if (!(serviceId in services) && service !== undefined) services[serviceId] = service;
}
