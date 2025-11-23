import {
  Module,
  ModuleData,
  CreateModuleRequest,
  UpdateModuleRequest,
} from "../models/module.model";

/**
 * Response format for modules list
 */
export interface ModulesResponse {
  data: ModuleData[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * Module Mapper
 * Handles conversion between API data and domain models
 */
export class ModuleMapper {
  /**
   * Convert API data to Module domain model
   */
  static fromJson(data: ModuleData): Module {
    return new Module(
      data.id,
      data.name,
      data.description,
      data.isActive,
      data.features ?? [],
      data.createdBy ?? null,
      data.createdTimestamp ?? null,
      data.lastModifiedBy ?? null,
      data.lastModifiedTimestamp ?? null
    );
  }

  /**
   * Convert Module domain model to API data
   */
  static toJson(module: Module): ModuleData {
    return {
      id: module.id,
      name: module.name,
      description: module.description,
      isActive: module.isActive,
      features: module.features,
      createdBy: module.createdBy,
      createdTimestamp: module.createdTimestamp,
      lastModifiedBy: module.lastModifiedBy,
      lastModifiedTimestamp: module.lastModifiedTimestamp,
    };
  }

  /**
   * Convert CreateModuleRequest to API request format
   */
  static createRequestToJson(request: CreateModuleRequest): Record<string, any> {
    return request.toJSON();
  }

  /**
   * Convert UpdateModuleRequest to API request format
   */
  static updateRequestToJson(request: UpdateModuleRequest): Record<string, any> {
    return request.toJSON();
  }

  /**
   * Handle API response and convert to domain models
   */
  static handleApiResponse(response: ModulesResponse): {
    modules: Module[];
    pagination?: ModulesResponse["pagination"];
  } {
    return {
      modules: response.data.map((data) => ModuleMapper.fromJson(data)),
      pagination: response.pagination,
    };
  }

  /**
   * Handle single module API response
   */
  static handleSingleResponse(data: ModuleData): Module {
    return ModuleMapper.fromJson(data);
  }
}
