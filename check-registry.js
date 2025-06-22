const { globalServiceRegistry } = require('./dist/shared/mcp-core/service-registry');

console.log('Available services:');
const services = globalServiceRegistry.getAllServices();
services.forEach(service => {
  const info = service.getInfo();
  console.log(`- ${info.name} (${info.version}) - Status: ${info.status}`);
});

console.log('\nLooking for OrganizationSchedulerManager...');
const schedulerService = globalServiceRegistry.getService('OrganizationSchedulerManager');
console.log('OrganizationSchedulerManager service:', schedulerService ? 'Found' : 'Not found');

if (schedulerService) {
  console.log('Service info:', schedulerService.getInfo());
}