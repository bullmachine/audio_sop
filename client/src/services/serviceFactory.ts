import { GenericCrudService } from './genericCrud';
import audioSopService from './audioSopService';

// Service factory for centralized service management
class ServiceFactory {
  private static instances: Map<string, GenericCrudService<any>> = new Map();

  private static getService<T>(endpoint: string): GenericCrudService<T> {
    if (!this.instances.has(endpoint)) {
      this.instances.set(endpoint, new GenericCrudService<T>(endpoint));
    }
    return this.instances.get(endpoint) as GenericCrudService<T>;
  }

  // Predefined service getters using RESTful endpoints
  // Note: API_BASE_URL already includes '/api', so we don't add it here

  static get stageService() {
    return this.getService<any>('/stage');
  }

  static get languageService() {
    return this.getService<any>('/language');
  }

  static get productService() {
    return this.getService<any>('/product');
  }

  static get operatorService() {
    return this.getService<any>('/operator');
  }

  static get audioSopService() {
    return audioSopService;
  }

  static get roleService() {
    return this.getService<any>('/role');
  }

  static get userService() {
    return this.getService<any>('/users');
  }

  static get roleUserService() {
    return this.getService<any>('/roleUser');
  }

  static get permissionService() {
    return this.getService<any>('/permission');
  }

  // Custom permission service with special create endpoint
  static get permissionCreateService() {
    return this.getService<any>('/permission/create');
  }

  // Custom permission service for module updates
  static get permissionUpdateModuleService() {
    return this.getService<any>('/permission/update-module');
  }

  // User permission service for assignments
  static get userPermissionService() {
    return this.getService<any>('/userPermission');
  }
 
  // Custom service for user permission assignment
  static get userPermissionAssignService() {
    return this.getService<any>('/userPermission/assign');
  }

  // Custom service for removing user permissions
  static get userPermissionRemoveService() {
    return this.getService<any>('/userPermission/remove');
  }

 
  // Generic service getter for custom endpoints
  static createService<T>(endpoint: string): GenericCrudService<T> {
    return new GenericCrudService<T>(endpoint);
  }
}

export default ServiceFactory;
