/**
 * Domain Layer Exports
 * 
 * Central export point for all domain models, entities, and mappers.
 * This provides a clean interface for importing domain objects
 * throughout the application.
 */

// User domain
export { User, type UserData } from './models/user.model';

// Authentication domain
export { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  type LoginRequestData,
  type LoginResponseData,
  type RefreshTokenRequestData
} from './models/auth.model';

// Navigation domain
export {
  MenuItem,
  NavigationData,
  MenuItemsResponse,
  type MenuItemData,
  type NavigationDataData,
  type MenuItemsResponseData
} from './models/navigation.model';

// Notification domain
export {
  Notification,
  NotificationConfig,
  NotificationQueue,
  NotificationType,
  NotificationPosition,
  type NotificationData,
  type NotificationAction,
  type NotificationConfigData
} from './models/notification.model';

// Product domain
export {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  type ProductData,
  type CreateProductRequestData,
  type UpdateProductRequestData
} from './models/product.model';

// TreeNode domain
export {
  TreeNode,
  CreateTreeNodeRequest,
  UpdateTreeNodeRequest,
  type TreeNodeData,
  type CreateTreeNodeRequestData,
  type UpdateTreeNodeRequestData
} from './models/tree-node.model';

// Mappers
export { UserMapper, AuthMapper, NavigationMapper, NotificationMapper, ProductMapper, TreeNodeMapper } from './mappers';

// Response Types
export type { ProductsResponse } from './mappers/product.mapper';
export type { TreeNodesResponse } from './mappers/tree-node.mapper';
